import * as THREE from 'three'

/**
 * Motor de Renderização e Visualização 3D com Three.js
 * Gerencia a cena espacial, luzes, nós esféricos, conexões, etiquetas e interações de câmera.
 */
export class ThreeSceneManager {
  /**
   * @param {HTMLElement} container Elemento DOM contêiner
   * @param {Object} options Callbacks de seleção e configurações
   */
  constructor(container, options = {}) {
    this.container = container
    this.onSelectVertex = options.onSelectVertex || (() => {})
    this.onSelectEdge = options.onSelectEdge || (() => {})
    this.theme = options.theme || 'light'

    this.scene = null
    this.camera = null
    this.renderer = null
    this.gridHelper = null
    this.animationFrameId = null
    this.autoRotate = false

    // Grupos de Objetos 3D
    this.nodesGroup = new THREE.Group()
    this.edgesGroup = new THREE.Group()
    this.labelsGroup = new THREE.Group()
    this.edgeLabelsGroup = new THREE.Group()

    // Mapas para busca rápida por ID
    this.nodeMeshes = new Map() // vertexId -> Mesh
    this.edgeMeshes = new Map() // edgeId -> Object3D

    // Controle de Câmera
    this.isDragging = false
    this.isPanning = false
    this.previousMousePosition = { x: 0, y: 0 }
    this.cameraDistance = 85
    this.cameraTarget = new THREE.Vector3(0, 0, 0)
    this.spherical = new THREE.Spherical(85, Math.PI / 3, Math.PI / 4)

    // Raycaster para seleção
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    // Suporte a Gestos Touch Mobile
    this.previousTouchPosition = { x: 0, y: 0 }
    this.initialPinchDistance = null
    this.touchHasMovedSignificantly = false
    this.lastTouchCoords = { clientX: 0, clientY: 0 }

    this.init()
  }

  init() {
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 500

    // 1. Cena com suporte a Tema Claro (padrão) e Escuro
    this.scene = new THREE.Scene()
    const isLight = this.theme === 'light'
    const bgColor = isLight ? 0xf1f5f9 : 0x0a0d14
    this.scene.background = new THREE.Color(bgColor)
    this.scene.fog = new THREE.FogExp2(bgColor, isLight ? 0.003 : 0.004)

    // Grade de referência sutil
    this.gridHelper = new THREE.GridHelper(160, 32, isLight ? 0x94a3b8 : 0x334155, isLight ? 0xcbd5e1 : 0x1e293b)
    this.gridHelper.position.y = -35
    this.gridHelper.material.opacity = isLight ? 0.6 : 0.4
    this.gridHelper.material.transparent = true
    this.scene.add(this.gridHelper)

    // 2. Câmera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    this.updateCameraPosition()

    // 3. Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.container.appendChild(this.renderer.domElement)

    // 4. Luzes de Estúdio Neutras (Cores puras sem distorção cromática)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95)
    this.scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4)
    dirLight1.position.set(60, 80, 50)
    this.scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 0.8)
    dirLight2.position.set(-60, -40, -50)
    this.scene.add(dirLight2)

    // Adiciona os grupos à cena
    this.scene.add(this.edgesGroup)
    this.scene.add(this.nodesGroup)
    this.scene.add(this.labelsGroup)
    this.scene.add(this.edgeLabelsGroup)

    // 5. Event Listeners
    this._bindEvents()

    // 6. Loop de Renderização
    this.animate()
  }

  _bindEvents() {
    this._onMouseDown = this.onMouseDown.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)
    this._onMouseUp = this.onMouseUp.bind(this)
    this._onWheel = this.onWheel.bind(this)
    this._onContextMenu = e => e.preventDefault()
    this._onResize = this.onWindowResize.bind(this)

    this._onTouchStart = this.onTouchStart.bind(this)
    this._onTouchMove = this.onTouchMove.bind(this)
    this._onTouchEnd = this.onTouchEnd.bind(this)

    const dom = this.renderer.domElement
    dom.style.touchAction = 'none'
    dom.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('mousemove', this._onMouseMove)
    window.addEventListener('mouseup', this._onMouseUp)
    dom.addEventListener('wheel', this._onWheel, { passive: false })
    dom.addEventListener('contextmenu', this._onContextMenu)
    window.addEventListener('resize', this._onResize)

    // Touch events para dispositivos móveis
    dom.addEventListener('touchstart', this._onTouchStart, { passive: false })
    dom.addEventListener('touchmove', this._onTouchMove, { passive: false })
    dom.addEventListener('touchend', this._onTouchEnd, { passive: false })
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      this.previousTouchPosition = { x: touch.clientX, y: touch.clientY }
      this.lastTouchCoords = { clientX: touch.clientX, clientY: touch.clientY }
      this.touchHasMovedSignificantly = false
      this.initialPinchDistance = null
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      this.initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    }
  }

  onTouchMove(e) {
    if (e.cancelable) e.preventDefault()

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      this.lastTouchCoords = { clientX: touch.clientX, clientY: touch.clientY }
      const deltaX = touch.clientX - this.previousTouchPosition.x
      const deltaY = touch.clientY - this.previousTouchPosition.y

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        this.touchHasMovedSignificantly = true
      }

      this.spherical.theta -= deltaX * 0.009
      this.spherical.phi -= deltaY * 0.009
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi))
      this.updateCameraPosition()

      this.previousTouchPosition = { x: touch.clientX, y: touch.clientY }
    } else if (e.touches.length === 2) {
      this.touchHasMovedSignificantly = true
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

      if (this.initialPinchDistance) {
        const factor = this.initialPinchDistance / currentDistance
        this.spherical.radius = Math.max(15, Math.min(250, this.spherical.radius * factor))
        this.updateCameraPosition()
      }
      this.initialPinchDistance = currentDistance
    }
  }

  onTouchEnd(e) {
    if (!this.touchHasMovedSignificantly && this.lastTouchCoords.clientX) {
      this.performRaycast(this.lastTouchCoords)
    }
    this.initialPinchDistance = null
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.isDragging = true
      this.isPanning = false
    } else if (e.button === 2) {
      this.isPanning = true
      this.isDragging = false
    }
    this.previousMousePosition = { x: e.clientX, y: e.clientY }
    this.hasMovedSignificantly = false
  }

  onMouseMove(e) {
    const deltaX = e.clientX - this.previousMousePosition.x
    const deltaY = e.clientY - this.previousMousePosition.y

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      this.hasMovedSignificantly = true
    }

    if (this.isDragging) {
      this.spherical.theta -= deltaX * 0.008
      this.spherical.phi -= deltaY * 0.008
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi))
      this.updateCameraPosition()
    } else if (this.isPanning) {
      const panSpeed = 0.08
      const right = new THREE.Vector3()
      const up = new THREE.Vector3(0, 1, 0)
      this.camera.getWorldDirection(right)
      right.cross(up).normalize()

      this.cameraTarget.addScaledVector(right, -deltaX * panSpeed)
      this.cameraTarget.y += deltaY * panSpeed
      this.updateCameraPosition()
    }

    this.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  onMouseUp(e) {
    // Se foi apenas um clique sem arrastar, efetua raycasting para seleção
    if (!this.hasMovedSignificantly && (this.isDragging || this.isPanning)) {
      this.performRaycast(e)
    }
    this.isDragging = false
    this.isPanning = false
  }

  onWheel(e) {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92
    this.spherical.radius = Math.max(15, Math.min(250, this.spherical.radius * zoomFactor))
    this.updateCameraPosition()
  }

  updateCameraPosition() {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical)
    this.camera.position.copy(this.cameraTarget).add(offset)
    this.camera.lookAt(this.cameraTarget)
  }

  performRaycast(event) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    // 1. Testa interseção com nós
    const nodeIntersects = this.raycaster.intersectObjects(this.nodesGroup.children, true)
    if (nodeIntersects.length > 0) {
      let currentObj = nodeIntersects[0].object
      while (currentObj && !currentObj.userData?.vertexId && currentObj.parent) {
        currentObj = currentObj.parent
      }
      if (currentObj && currentObj.userData?.vertexId) {
        this.onSelectVertex(currentObj.userData.vertexId)
        return
      }
    }

    // 2. Testa interseção com arestas
    const edgeIntersects = this.raycaster.intersectObjects(this.edgesGroup.children, true)
    if (edgeIntersects.length > 0) {
      let currentEdgeObj = edgeIntersects[0].object
      while (currentEdgeObj && !currentEdgeObj.userData?.edgeId && currentEdgeObj.parent) {
        currentEdgeObj = currentEdgeObj.parent
      }
      if (currentEdgeObj && currentEdgeObj.userData?.edgeId) {
        this.onSelectEdge(currentEdgeObj.userData.edgeId)
      }
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // --- CONSTRUÇÃO DO GRAFO 3D ---

  /**
   * Atualiza ou recria a cena gráfica 3D a partir do GraphModel e dos destaques algorítmicos
   * @param {import('../graph/graphModel.js').GraphModel} graph
   * @param {Object} [highlights] { vertexStatus: {}, edgeStatus: {} }
   * @param {string|null} [selectedVertexId]
   * @param {string|null} [selectedEdgeId]
   */
  updateGraph(graph, highlights = {}, selectedVertexId = null, selectedEdgeId = null) {
    if (!graph || !this.scene) return

    const { vertexStatus = {}, edgeStatus = {} } = highlights

    // Limpa objetos anteriores
    this._clearGroup(this.nodesGroup)
    this._clearGroup(this.edgesGroup)
    this._clearGroup(this.labelsGroup)
    this._clearGroup(this.edgeLabelsGroup)
    this.nodeMeshes.clear()
    this.edgeMeshes.clear()

    const nodePositions = new Map()

    // 1. Criação dos Nós 3D
    graph.vertices.forEach(v => {
      const pos = new THREE.Vector3(v.x || 0, v.y || 0, v.z || 0)
      nodePositions.set(v.id, pos)

      const status = vertexStatus[v.id] || null
      const isSelected = selectedVertexId === v.id
      const nodeColor = this._getNodeColor(v.type, status, isSelected)

      // Grupo do Vértice
      const nodeObj = new THREE.Group()
      nodeObj.position.copy(pos)
      nodeObj.userData = { vertexId: v.id, label: v.label }

      // Esfera Central Sólida e Elegante
      const sphereGeo = new THREE.SphereGeometry(2.5, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor.base,
        emissive: nodeColor.emissive,
        emissiveIntensity: isSelected || status === 'current' ? 1.5 : 0.6,
        roughness: 0.25,
        metalness: 0.7
      })
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
      nodeObj.add(sphereMesh)

      this.nodesGroup.add(nodeObj)
      this.nodeMeshes.set(v.id, nodeObj)

      // Rótulo do Vértice com Reconhecimento Semântico de Cor
      const labelSprite = this._createLabelSprite(`${v.id} - ${v.label}`, status, isSelected)
      labelSprite.position.set(pos.x, pos.y + 4.5, pos.z)
      this.labelsGroup.add(labelSprite)
    })

    // 2. Criação das Arestas 3D
    graph.edges.forEach(edge => {
      const p1 = nodePositions.get(edge.source)
      const p2 = nodePositions.get(edge.target)
      if (!p1 || !p2) return

      const isSelected = selectedEdgeId === edge.id
      const status = edgeStatus[edge.id] || edgeStatus[`${edge.source}->${edge.target}`] || null
      const edgeColor = this._getEdgeColor(status, isSelected)

      const edgeObj = new THREE.Group()
      edgeObj.userData = { edgeId: edge.id, source: edge.source, target: edge.target }

      const distance = p1.distanceTo(p2)
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)

      // Conexão em Cilindro
      const radius = status === 'tree' || status === 'path' || isSelected ? 0.45 : 0.22
      const cylinderGeo = new THREE.CylinderGeometry(radius, radius, distance, 14)
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: edgeColor.base,
        emissive: edgeColor.emissive,
        emissiveIntensity: status ? 1.3 : 0.4,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: status === 'cycle' ? 0.6 : 0.9
      })
      const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat)

      // Orienta o cilindro entre p1 e p2
      cylinderMesh.position.copy(midPoint)
      cylinderMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(p2, p1).normalize()
      )
      edgeObj.add(cylinderMesh)

      // Se direcionado: Adiciona Cone de Direção (Seta)
      if (graph.directed) {
        const coneRadius = 1.0
        const coneHeight = 2.2
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 16)
        const coneMat = new THREE.MeshStandardMaterial({
          color: edgeColor.base,
          emissive: edgeColor.emissive,
          emissiveIntensity: 0.8
        })
        const coneMesh = new THREE.Mesh(coneGeo, coneMat)

        // Posiciona a seta a 75% do caminho de p1 para p2
        const arrowPos = new THREE.Vector3().lerpVectors(p1, p2, 0.72)
        coneMesh.position.copy(arrowPos)
        coneMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3().subVectors(p2, p1).normalize()
        )
        edgeObj.add(coneMesh)
      }

      this.edgesGroup.add(edgeObj)
      this.edgeMeshes.set(edge.id, edgeObj)

      // Rótulo do Peso da Aresta (se ponderado)
      if (graph.weighted) {
        const weightText = String(edge.weight)
        const weightSprite = this._createWeightBadgeSprite(weightText, status)
        weightSprite.position.copy(midPoint).add(new THREE.Vector3(0, 1.8, 0))
        this.edgeLabelsGroup.add(weightSprite)
      }
    })
  }

  setTheme(theme) {
    this.theme = theme
    const isLight = theme === 'light'
    const bgColor = isLight ? 0xf1f5f9 : 0x0a0d14
    if (this.scene) {
      this.scene.background.set(bgColor)
      if (this.scene.fog) {
        this.scene.fog.color.set(bgColor)
      }
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper)
      if (this.gridHelper.geometry) this.gridHelper.geometry.dispose()
      if (this.gridHelper.material) this.gridHelper.material.dispose()

      this.gridHelper = new THREE.GridHelper(160, 32, isLight ? 0x94a3b8 : 0x334155, isLight ? 0xcbd5e1 : 0x1e293b)
      this.gridHelper.position.y = -35
      this.gridHelper.material.opacity = isLight ? 0.6 : 0.4
      this.gridHelper.material.transparent = true
      this.scene.add(this.gridHelper)
    }
  }

  _getNodeColor(type, status, isSelected) {
    const isLight = this.theme === 'light'
    if (isSelected) {
      return { base: isLight ? 0x2563eb : 0xffffff, emissive: 0x3b82f6 }
    }
    // Cores Semânticas Claras para Auxiliar Identificação Imediata
    if (status === 'current') {
      return { base: isLight ? 0xd97706 : 0xf59e0b, emissive: isLight ? 0xb45309 : 0xd97706 } // Âmbar Dourado
    }
    if (status === 'visited') {
      return { base: isLight ? 0x059669 : 0x10b981, emissive: isLight ? 0x047857 : 0x059669 } // Verde Esmeralda
    }
    if (status === 'queued') {
      return { base: isLight ? 0x7c3aed : 0x8b5cf6, emissive: isLight ? 0x6d28d9 : 0x6d28d9 } // Violeta Intenso
    }
    if (status === 'settled') {
      return { base: isLight ? 0x0284c7 : 0x0284c7, emissive: isLight ? 0x0369a1 : 0x0369a1 } // Azul Aço
    }
    if (status === 'path') {
      return { base: isLight ? 0x0284c7 : 0x38bdf8, emissive: isLight ? 0x0369a1 : 0x0284c7 } // Azul Céu
    }
    if (status === 'source') {
      return { base: isLight ? 0x1d4ed8 : 0x3b82f6, emissive: 0x1d4ed8 } // Azul Real
    }
    if (status === 'target') {
      return { base: isLight ? 0xdc2626 : 0xef4444, emissive: 0xb91c1c } // Vermelho
    }

    // Estado Padrão Não-Visitado (No modo claro: grafite escuro de alto contraste para projetor!)
    if (isLight) {
      switch (type) {
        case 'hub':
          return { base: 0x1e293b, emissive: 0x0f172a }
        case 'datacenter':
          return { base: 0x1e293b, emissive: 0x0f172a }
        default:
          return { base: 0x334155, emissive: 0x1e293b }
      }
    } else {
      switch (type) {
        case 'hub':
          return { base: 0x94a3b8, emissive: 0x334155 }
        case 'datacenter':
          return { base: 0x94a3b8, emissive: 0x334155 }
        default:
          return { base: 0x64748b, emissive: 0x1e293b }
      }
    }
  }

  _getEdgeColor(status, isSelected) {
    const isLight = this.theme === 'light'
    if (isSelected) {
      return { base: isLight ? 0x2563eb : 0xffffff, emissive: 0x3b82f6 }
    }
    // Cores Semânticas de Conexão
    if (status === 'tree') {
      return { base: isLight ? 0x059669 : 0x10b981, emissive: isLight ? 0x047857 : 0x059669 } // Verde
    }
    if (status === 'cycle') {
      return { base: isLight ? 0xdc2626 : 0xef4444, emissive: isLight ? 0xb91c1c : 0x991b1b } // Vermelho
    }
    if (status === 'examining') {
      return { base: isLight ? 0xd97706 : 0xf59e0b, emissive: isLight ? 0xb45309 : 0xb45309 } // Âmbar
    }
    if (status === 'path') {
      return { base: isLight ? 0x0284c7 : 0x38bdf8, emissive: isLight ? 0x0369a1 : 0x0284c7 } // Azul
    }
    return { base: isLight ? 0x94a3b8 : 0x475569, emissive: isLight ? 0x64748b : 0x1e293b }
  }

  _createLabelSprite(text, status = null, isSelected = false) {
    const isLight = this.theme === 'light'
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    // Cores Semânticas de Alto Contraste no Rótulo
    let bgColor = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.92)'
    let borderColor = isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.25)'
    let textColor = isLight ? '#0f172a' : '#f8fafc'

    if (isSelected) {
      bgColor = isLight ? '#2563eb' : '#3b82f6'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    } else if (status === 'current') {
      bgColor = isLight ? '#d97706' : '#f59e0b'
      borderColor = isLight ? '#b45309' : '#fde68a'
      textColor = isLight ? '#ffffff' : '#1c1917'
    } else if (status === 'visited') {
      bgColor = isLight ? '#059669' : '#10b981'
      borderColor = isLight ? '#047857' : '#6ee7b7'
      textColor = '#ffffff'
    } else if (status === 'queued') {
      bgColor = isLight ? '#7c3aed' : '#8b5cf6'
      borderColor = isLight ? '#6d28d9' : '#c4b5fd'
      textColor = '#ffffff'
    } else if (status === 'path') {
      bgColor = isLight ? '#0284c7' : '#38bdf8'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    } else if (status === 'source') {
      bgColor = isLight ? '#2563eb' : '#3b82f6'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    } else if (status === 'target') {
      bgColor = isLight ? '#dc2626' : '#ef4444'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    }

    ctx.fillStyle = bgColor
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(8, 8, 240, 48, 14)
    ctx.fill()
    ctx.stroke()

    // Texto
    ctx.fillStyle = textColor
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(9, 2.25, 1)
    return sprite
  }

  _createWeightBadgeSprite(weightText, status) {
    const isLight = this.theme === 'light'
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    let bgColor = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.92)'
    let borderColor = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'
    let textColor = isLight ? '#0f172a' : '#e2e8f0'

    if (status === 'tree') {
      bgColor = isLight ? 'rgba(5, 150, 105, 0.15)' : 'rgba(6, 78, 59, 0.95)'
      borderColor = isLight ? '#059669' : '#10b981'
      textColor = isLight ? '#047857' : '#34d399'
    } else if (status === 'cycle') {
      bgColor = isLight ? 'rgba(220, 38, 38, 0.15)' : 'rgba(127, 29, 29, 0.95)'
      borderColor = isLight ? '#dc2626' : '#ef4444'
      textColor = isLight ? '#b91c1c' : '#f87171'
    } else if (status === 'path') {
      bgColor = isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(14, 116, 144, 0.95)'
      borderColor = isLight ? '#0284c7' : '#38bdf8'
      textColor = isLight ? '#0369a1' : '#ffffff'
    } else if (status === 'examining') {
      bgColor = isLight ? 'rgba(217, 119, 6, 0.15)' : 'rgba(120, 53, 15, 0.95)'
      borderColor = isLight ? '#d97706' : '#f59e0b'
      textColor = isLight ? '#b45309' : '#fde68a'
    }

    ctx.fillStyle = bgColor
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(8, 8, 80, 48, 10)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = 'bold 22px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(weightText, 48, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(3.8, 2.5, 1)
    return sprite
  }

  _clearGroup(group) {
    while (group.children.length > 0) {
      const obj = group.children[0]
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        } else {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      }
      group.remove(obj)
    }
  }

  fitCameraToGraph() {
    if (this.nodesGroup.children.length === 0) return

    const box = new THREE.Box3().setFromObject(this.nodesGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 20)

    this.cameraTarget.copy(center)
    this.spherical.radius = maxDim * 1.8
    this.updateCameraPosition()
  }

  resetCamera() {
    this.cameraTarget.set(0, 0, 0)
    this.spherical.set(85, Math.PI / 3, Math.PI / 4)
    this.updateCameraPosition()
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate
    return this.autoRotate
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))

    if (this.autoRotate && !this.isDragging && !this.isPanning) {
      this.spherical.theta += 0.003
      this.updateCameraPosition()
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    const dom = this.renderer?.domElement
    if (dom) {
      dom.removeEventListener('mousedown', this._onMouseDown)
      window.removeEventListener('mousemove', this._onMouseMove)
      window.removeEventListener('mouseup', this._onMouseUp)
      dom.removeEventListener('wheel', this._onWheel)
      dom.removeEventListener('contextmenu', this._onContextMenu)
      window.removeEventListener('resize', this._onResize)
      dom.removeEventListener('touchstart', this._onTouchStart)
      dom.removeEventListener('touchmove', this._onTouchMove)
      dom.removeEventListener('touchend', this._onTouchEnd)
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom)
      }
    }

    this._clearGroup(this.nodesGroup)
    this._clearGroup(this.edgesGroup)
    this._clearGroup(this.labelsGroup)
    this._clearGroup(this.edgeLabelsGroup)

    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer = null
    }

    this.scene = null
    this.camera = null
  }
}
