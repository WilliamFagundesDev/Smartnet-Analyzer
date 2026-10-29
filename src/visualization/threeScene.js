import * as THREE from 'three'

/**
 * Motor de Renderização e Visualização Espacial 3D com Three.js
 * Arquitetura de alto padrão, materiais PBR, feedback visual por raio,
 * sincronização multi-câmera e seleção geométrica de arestas sem alteração de cor.
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
    this.onClearSelection = options.onClearSelection || null
    this.onCameraChange = options.onCameraChange || null
    this.theme = options.theme || 'light'

    this.scene = null
    this.camera = null
    this.renderer = null
    this.gridHelper = null
    this.animationFrameId = null
    this.resizeObserver = null
    this.autoRotate = false
    this._isApplyingExternalCamera = false

    // Estado atual de seleção para toggle seguro
    this.currentSelectedVertexId = null
    this.currentSelectedEdgeId = null

    // Grupos de Objetos 3D
    this.nodesGroup = new THREE.Group()
    this.edgesGroup = new THREE.Group()
    this.labelsGroup = new THREE.Group()
    this.edgeLabelsGroup = new THREE.Group()
    this.haloGroup = new THREE.Group()

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

    // Raycaster para seleção e hover
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hoveredVertexId = null
    this.hoveredEdgeId = null

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

    // 1. Cena com suporte a Tema Claro e Escuro
    this.scene = new THREE.Scene()
    const isLight = this.theme === 'light'
    const bgColor = isLight ? 0xf8fafc : 0x090d16
    this.scene.background = new THREE.Color(bgColor)
    this.scene.fog = new THREE.FogExp2(bgColor, isLight ? 0.0025 : 0.0035)

    // Grade de referência delicada
    this.gridHelper = new THREE.GridHelper(
      180,
      36,
      isLight ? 0xd8deeb : 0x1e293b,
      isLight ? 0xe7eaf2 : 0x141c2e
    )
    this.gridHelper.position.y = -36
    this.gridHelper.material.opacity = isLight ? 0.7 : 0.45
    this.gridHelper.material.transparent = true
    this.scene.add(this.gridHelper)

    // 2. Câmera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    this.updateCameraPosition(false)

    // 3. Renderizador WebGL de Precisão
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.container.appendChild(this.renderer.domElement)

    // 4. Iluminação PBR balanceada
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.95 : 0.75)
    this.scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, isLight ? 1.4 : 1.6)
    dirLight1.position.set(70, 90, 60)
    this.scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(isLight ? 0x94a3b8 : 0x38bdf8, isLight ? 0.6 : 0.8)
    dirLight2.position.set(-70, -40, -60)
    this.scene.add(dirLight2)

    // Adiciona grupos à cena na ordem de profundidade
    this.scene.add(this.edgesGroup)
    this.scene.add(this.haloGroup)
    this.scene.add(this.nodesGroup)
    this.scene.add(this.labelsGroup)
    this.scene.add(this.edgeLabelsGroup)

    // 5. Event Listeners & ResizeObserver para grades dinâmicas (1, 2, 3 ou 4 viewports)
    this._bindEvents()
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onWindowResize()
      })
      this.resizeObserver.observe(this.container)
    }

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

    // Touch events para mobile
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
      this.updateCameraPosition(true)

      this.previousTouchPosition = { x: touch.clientX, y: touch.clientY }
    } else if (e.touches.length === 2) {
      this.touchHasMovedSignificantly = true
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

      if (this.initialPinchDistance) {
        const factor = this.initialPinchDistance / currentDistance
        this.spherical.radius = Math.max(15, Math.min(250, this.spherical.radius * factor))
        this.updateCameraPosition(true)
      }
      this.initialPinchDistance = currentDistance
    }
  }

  onTouchEnd() {
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
      this.updateCameraPosition(true)
    } else if (this.isPanning) {
      const panSpeed = 0.08
      const right = new THREE.Vector3()
      const up = new THREE.Vector3(0, 1, 0)
      this.camera.getWorldDirection(right)
      right.cross(up).normalize()

      this.cameraTarget.addScaledVector(right, -deltaX * panSpeed)
      this.cameraTarget.y += deltaY * panSpeed
      this.updateCameraPosition(true)
    } else {
      // Hover feedback quando o mouse apenas desliza
      this._handleHoverRaycast(e)
    }

    this.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  _handleHoverRaycast(event) {
    if (!this.renderer || !this.camera) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return
    }

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const nodeIntersects = this.raycaster.intersectObjects(this.nodesGroup.children, true)
    const edgeIntersects = this.raycaster.intersectObjects(this.edgesGroup.children, true)

    if (nodeIntersects.length > 0 || edgeIntersects.length > 0) {
      this.renderer.domElement.style.cursor = 'pointer'
    } else {
      this.renderer.domElement.style.cursor = 'default'
    }
  }

  onMouseUp(e) {
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
    this.updateCameraPosition(true)
  }

  updateCameraPosition(shouldEmit = false) {
    if (!this.camera) return
    const offset = new THREE.Vector3().setFromSpherical(this.spherical)
    this.camera.position.copy(this.cameraTarget).add(offset)
    this.camera.lookAt(this.cameraTarget)

    if (shouldEmit && !this._isApplyingExternalCamera && this.onCameraChange) {
      this.onCameraChange(this.getCameraState())
    }
  }

  getCameraState() {
    return {
      radius: this.spherical.radius,
      phi: this.spherical.phi,
      theta: this.spherical.theta,
      targetX: this.cameraTarget.x,
      targetY: this.cameraTarget.y,
      targetZ: this.cameraTarget.z
    }
  }

  setCameraState(state) {
    if (!state || !this.camera) return
    this._isApplyingExternalCamera = true
    if (typeof state.radius === 'number') this.spherical.radius = state.radius
    if (typeof state.phi === 'number') this.spherical.phi = state.phi
    if (typeof state.theta === 'number') this.spherical.theta = state.theta
    if (
      typeof state.targetX === 'number' &&
      typeof state.targetY === 'number' &&
      typeof state.targetZ === 'number'
    ) {
      this.cameraTarget.set(state.targetX, state.targetY, state.targetZ)
    }
    this.updateCameraPosition(false)
    this._isApplyingExternalCamera = false
  }

  performRaycast(event) {
    if (!this.renderer || !this.camera) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

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
        const clickedVertexId = currentObj.userData.vertexId
        this.onSelectVertex(this.currentSelectedVertexId === clickedVertexId ? null : clickedVertexId)
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
        const clickedEdgeId = currentEdgeObj.userData.edgeId
        this.onSelectEdge(this.currentSelectedEdgeId === clickedEdgeId ? null : clickedEdgeId)
        return
      }
    }

    // 3. Clique no fundo vazio limpa seleção ativa
    if (this.currentSelectedEdgeId || this.currentSelectedVertexId) {
      if (this.onClearSelection) {
        this.onClearSelection()
      } else {
        if (this.currentSelectedEdgeId) this.onSelectEdge(null)
        if (this.currentSelectedVertexId) this.onSelectVertex(null)
      }
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (!width || !height) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // --- CONSTRUÇÃO DO GRAFO 3D ---

  /**
   * Atualiza ou recria a cena gráfica 3D a partir do GraphModel e dos destaques algorítmicos
   */
  updateGraph(graph, highlights = {}, selectedVertexId = null, selectedEdgeId = null) {
    if (!graph || !this.scene) return

    this.currentSelectedVertexId = selectedVertexId
    this.currentSelectedEdgeId = selectedEdgeId

    const { vertexStatus = {}, edgeStatus = {} } = highlights
    const isLight = this.theme === 'light'

    // Limpa objetos anteriores liberando memória GPU
    this._clearGroup(this.nodesGroup)
    this._clearGroup(this.edgesGroup)
    this._clearGroup(this.labelsGroup)
    this._clearGroup(this.edgeLabelsGroup)
    this._clearGroup(this.haloGroup)
    this.nodeMeshes.clear()
    this.edgeMeshes.clear()

    const nodePositions = new Map()

    // 1. Criação dos Nós 3D com Geometria Limpa
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

      // Esfera PBR do Nó
      const sphereGeo = new THREE.SphereGeometry(2.4, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor.base,
        emissive: nodeColor.emissive,
        emissiveIntensity: isSelected || status === 'current' ? 1.4 : 0.5,
        roughness: 0.28,
        metalness: 0.35
      })
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
      nodeObj.add(sphereMesh)

      // Halo / Anel luminoso para o nó atual sendo processado ou selecionado
      if (status === 'current' || isSelected) {
        const ringGeo = new THREE.RingGeometry(2.8, 3.4, 32)
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x4f63f6 : 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        })
        const ringMesh = new THREE.Mesh(ringGeo, ringMat)
        ringMesh.position.copy(pos)
        ringMesh.lookAt(this.camera.position)
        ringMesh.userData = { isBillboardHalo: true }
        this.haloGroup.add(ringMesh)
      }

      this.nodesGroup.add(nodeObj)
      this.nodeMeshes.set(v.id, nodeObj)

      // Rótulo Sprite de Alta Definição
      const labelSprite = this._createLabelSprite(`${v.id} · ${v.label}`, status, isSelected)
      labelSprite.position.set(pos.x, pos.y + 4.4, pos.z)
      this.labelsGroup.add(labelSprite)
    })

    // 2. Criação das Arestas 3D
    graph.edges.forEach(edge => {
      const p1 = nodePositions.get(edge.source)
      const p2 = nodePositions.get(edge.target)
      if (!p1 || !p2) return

      const isSelected = selectedEdgeId === edge.id
      const status =
        edgeStatus[edge.id] ||
        edgeStatus[`${edge.source}->${edge.target}`] ||
        (!graph.directed ? edgeStatus[`${edge.target}->${edge.source}`] : null) ||
        null

      // IMPORTANTE: A cor da aresta NUNCA muda ao ser selecionada, preservando 100% da semântica do algoritmo
      const edgeColor = this._getEdgeColor(status)

      const edgeObj = new THREE.Group()
      edgeObj.userData = { edgeId: edge.id, source: edge.source, target: edge.target }

      const distance = p1.distanceTo(p2)
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      const direction = new THREE.Vector3().subVectors(p2, p1).normalize()

      const cylinderQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      )

      // Cilindro principal da conexão (espessura e cor estritamente semânticas)
      const isThick = status === 'tree' || status === 'path' || status === 'examining'
      const radius = isThick ? 0.42 : 0.22
      const cylinderGeo = new THREE.CylinderGeometry(radius, radius, distance, 14)
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: edgeColor.base,
        emissive: edgeColor.emissive,
        emissiveIntensity: status ? 1.2 : 0.35,
        roughness: 0.32,
        metalness: 0.5,
        transparent: true,
        opacity: status === 'cycle' ? 0.68 : 0.95
      })
      const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat)
      cylinderMesh.position.copy(midPoint)
      cylinderMesh.quaternion.copy(cylinderQuat)
      edgeObj.add(cylinderMesh)

      // Cilindro invisível expandido para facilitar o clique (hitbox de seleção 3D)
      const hitCylinderGeo = new THREE.CylinderGeometry(1.25, 1.25, Math.max(0.5, distance - 4.5), 8)
      const hitCylinderMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
      const hitCylinderMesh = new THREE.Mesh(hitCylinderGeo, hitCylinderMat)
      hitCylinderMesh.position.copy(midPoint)
      hitCylinderMesh.quaternion.copy(cylinderQuat)
      edgeObj.add(hitCylinderMesh)

      // Indicador Geométrico de Seleção (SEM alterar a cor da aresta!)
      if (isSelected) {
        const sheathLength = Math.max(0.6, distance - 5.2)
        const neutralHex = isLight ? 0x0f172a : 0xf8fafc

        // 1. Cápsula translúcida neutra envolvendo a aresta (a cor real permanece visível por dentro)
        const sheathRadius = radius + 0.52
        const sheathGeo = new THREE.CylinderGeometry(sheathRadius, sheathRadius, sheathLength, 16, 1, true)
        const sheathMat = new THREE.MeshBasicMaterial({
          color: neutralHex,
          transparent: true,
          opacity: isLight ? 0.14 : 0.18,
          side: THREE.DoubleSide,
          depthWrite: false
        })
        const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat)
        sheathMesh.position.copy(midPoint)
        sheathMesh.quaternion.copy(cylinderQuat)
        this.haloGroup.add(sheathMesh)

        // 2. Anéis colares geométricos neutros ao longo da aresta (25%, 50%, 75%) com leve pulso
        const ringQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          direction
        )
        const ringPositions = distance > 12 ? [0.24, 0.5, 0.76] : [0.35, 0.65]
        ringPositions.forEach((t, idx) => {
          const collarPos = new THREE.Vector3().lerpVectors(p1, p2, t)
          const collarGeo = new THREE.TorusGeometry(radius + 0.68, 0.1, 12, 28)
          const collarMat = new THREE.MeshBasicMaterial({
            color: neutralHex,
            transparent: true,
            opacity: isLight ? 0.78 : 0.88
          })
          const collarMesh = new THREE.Mesh(collarGeo, collarMat)
          collarMesh.position.copy(collarPos)
          collarMesh.quaternion.copy(ringQuat)
          collarMesh.userData = { isEdgeSelectionCollar: true, phaseOffset: idx * 0.9 }
          this.haloGroup.add(collarMesh)
        })
      }

      // Se direcionado: Adiciona Seta de Direção (mantém a mesma cor semântica da aresta)
      if (graph.directed) {
        const coneRadius = 0.95
        const coneHeight = 2.1
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 16)
        const coneMat = new THREE.MeshStandardMaterial({
          color: edgeColor.base,
          emissive: edgeColor.emissive,
          emissiveIntensity: 0.8
        })
        const coneMesh = new THREE.Mesh(coneGeo, coneMat)

        const arrowPos = new THREE.Vector3().lerpVectors(p1, p2, 0.72)
        coneMesh.position.copy(arrowPos)
        coneMesh.quaternion.copy(cylinderQuat)
        edgeObj.add(coneMesh)
      }

      this.edgesGroup.add(edgeObj)
      this.edgeMeshes.set(edge.id, edgeObj)

      // Rótulo do Peso da Aresta (ou marcador geométrico neutro se não-ponderado e selecionada)
      if (graph.weighted) {
        const weightText = String(edge.weight)
        const weightSprite = this._createWeightBadgeSprite(weightText, status, isSelected)
        weightSprite.position.copy(midPoint).add(new THREE.Vector3(0, 1.8, 0))
        this.edgeLabelsGroup.add(weightSprite)
      } else if (isSelected) {
        const markerSprite = this._createUnweightedSelectionSprite()
        markerSprite.position.copy(midPoint).add(new THREE.Vector3(0, 1.8, 0))
        this.edgeLabelsGroup.add(markerSprite)
      }
    })
  }

  setTheme(theme) {
    this.theme = theme
    const isLight = theme === 'light'
    const bgColor = isLight ? 0xf8fafc : 0x090d16
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

      this.gridHelper = new THREE.GridHelper(
        180,
        36,
        isLight ? 0xd8deeb : 0x1e293b,
        isLight ? 0xe7eaf2 : 0x141c2e
      )
      this.gridHelper.position.y = -36
      this.gridHelper.material.opacity = isLight ? 0.7 : 0.45
      this.gridHelper.material.transparent = true
      this.scene.add(this.gridHelper)
    }
  }

  _getNodeColor(type, status, isSelected) {
    const isLight = this.theme === 'light'
    if (isSelected) {
      return { base: 0x4f63f6, emissive: 0x3e51e8 }
    }
    if (status === 'current') {
      return { base: 0xf59e0b, emissive: 0xd97706 } // Âmbar Dourado
    }
    if (status === 'visited') {
      return { base: 0x10b981, emissive: 0x059669 } // Verde Esmeralda
    }
    if (status === 'queued') {
      return { base: 0x8b5cf6, emissive: 0x7c3aed } // Violeta
    }
    if (status === 'settled') {
      return { base: 0x10b981, emissive: 0x059669 } // Verde Fixado
    }
    if (status === 'path') {
      return { base: 0x0ea5e9, emissive: 0x0284c7 } // Azul/Ciano Menor Caminho
    }
    if (status === 'source') {
      return { base: 0x4f63f6, emissive: 0x3e51e8 } // Azul Primário
    }
    if (status === 'target') {
      return { base: 0xef4444, emissive: 0xdc2626 } // Vermelho
    }

    // Estado Padrão Não-Visitado
    if (isLight) {
      switch (type) {
        case 'hub':
          return { base: 0x172033, emissive: 0x0f172a }
        case 'datacenter':
          return { base: 0x172033, emissive: 0x0f172a }
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

  /**
   * Cor semântica pura da aresta — intencionalmente independente de isSelected
   * para nunca confundir o usuário durante ou fora da execução de algoritmos.
   */
  _getEdgeColor(status) {
    const isLight = this.theme === 'light'
    if (status === 'tree') {
      return { base: 0x10b981, emissive: 0x059669 } // Verde (Árvore / AGM)
    }
    if (status === 'cycle') {
      return { base: 0xef4444, emissive: 0xdc2626 } // Vermelho (Ciclo Rejeitado)
    }
    if (status === 'examining') {
      return { base: 0xf59e0b, emissive: 0xd97706 } // Âmbar (Examinando / Relaxando)
    }
    if (status === 'path') {
      return { base: 0x0ea5e9, emissive: 0x0284c7 } // Azul Ciano (Menor Caminho)
    }
    return { base: isLight ? 0x94a3b8 : 0x475569, emissive: isLight ? 0x64748b : 0x1e293b }
  }

  _createLabelSprite(text, status = null, isSelected = false) {
    const isLight = this.theme === 'light'
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 96
    const ctx = canvas.getContext('2d')

    let bgColor = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(16, 21, 36, 0.92)'
    let borderColor = isLight ? '#d8deeb' : 'rgba(255, 255, 255, 0.2)'
    let textColor = isLight ? '#172033' : '#f8fafc'

    if (isSelected) {
      bgColor = '#4f63f6'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    } else if (status === 'current') {
      bgColor = '#f59e0b'
      borderColor = '#d97706'
      textColor = '#ffffff'
    } else if (status === 'visited' || status === 'settled') {
      bgColor = '#10b981'
      borderColor = '#059669'
      textColor = '#ffffff'
    } else if (status === 'queued') {
      bgColor = '#8b5cf6'
      borderColor = '#7c3aed'
      textColor = '#ffffff'
    } else if (status === 'path') {
      bgColor = '#0ea5e9'
      borderColor = '#0284c7'
      textColor = '#ffffff'
    } else if (status === 'source') {
      bgColor = '#4f63f6'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    } else if (status === 'target') {
      bgColor = '#ef4444'
      borderColor = '#ffffff'
      textColor = '#ffffff'
    }

    ctx.fillStyle = bgColor
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(12, 12, 360, 72, 22)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = 'bold 28px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 192, 48)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(9.5, 2.4, 1)
    return sprite
  }

  _createWeightBadgeSprite(weightText, status, isSelected = false) {
    const isLight = this.theme === 'light'
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 104
    const ctx = canvas.getContext('2d')

    // Cores do badge estritamente derivadas do status do algoritmo (NÃO mudam na seleção)
    let bgColor = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(16, 21, 36, 0.94)'
    let borderColor = isLight ? '#d8deeb' : 'rgba(255, 255, 255, 0.2)'
    let textColor = isLight ? '#172033' : '#e2e8f0'

    if (status === 'tree') {
      bgColor = isLight ? 'rgba(16, 185, 129, 0.16)' : 'rgba(6, 78, 59, 0.95)'
      borderColor = '#10b981'
      textColor = isLight ? '#059669' : '#34d399'
    } else if (status === 'cycle') {
      bgColor = isLight ? 'rgba(239, 68, 68, 0.16)' : 'rgba(127, 29, 29, 0.95)'
      borderColor = '#ef4444'
      textColor = isLight ? '#dc2626' : '#f87171'
    } else if (status === 'path') {
      bgColor = isLight ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 116, 144, 0.95)'
      borderColor = '#0ea5e9'
      textColor = isLight ? '#0284c7' : '#ffffff'
    } else if (status === 'examining') {
      bgColor = isLight ? 'rgba(245, 158, 11, 0.18)' : 'rgba(120, 53, 15, 0.95)'
      borderColor = '#f59e0b'
      textColor = isLight ? '#d97706' : '#fde68a'
    }

    // Pílula central do peso (26..134, 22..82 => 108x60)
    ctx.fillStyle = bgColor
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(26, 22, 108, 60, 14)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = 'bold 28px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(weightText, 80, 52)

    // Se selecionada: desenha colchetes de mira geométricos neutros [ ] ao redor sem alterar as cores!
    if (isSelected) {
      const bracketColor = isLight ? '#0f172a' : '#ffffff'
      ctx.strokeStyle = bracketColor
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const xL = 12
      const xR = 148
      const yT = 10
      const yB = 94
      const arm = 16

      // Canto superior esquerdo
      ctx.beginPath()
      ctx.moveTo(xL, yT + arm)
      ctx.lineTo(xL, yT)
      ctx.lineTo(xL + arm, yT)
      ctx.stroke()

      // Canto inferior esquerdo
      ctx.beginPath()
      ctx.moveTo(xL, yB - arm)
      ctx.lineTo(xL, yB)
      ctx.lineTo(xL + arm, yB)
      ctx.stroke()

      // Canto superior direito
      ctx.beginPath()
      ctx.moveTo(xR - arm, yT)
      ctx.lineTo(xR, yT)
      ctx.lineTo(xR, yT + arm)
      ctx.stroke()

      // Canto inferior direito
      ctx.beginPath()
      ctx.moveTo(xR - arm, yB)
      ctx.lineTo(xR, yB)
      ctx.lineTo(xR, yB - arm)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(4.75, 3.1, 1)
    return sprite
  }

  _createUnweightedSelectionSprite() {
    const isLight = this.theme === 'light'
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 96
    const ctx = canvas.getContext('2d')

    const bracketColor = isLight ? '#0f172a' : '#ffffff'
    ctx.strokeStyle = bracketColor
    ctx.lineWidth = 5
    ctx.setLineDash([10, 7])
    ctx.beginPath()
    ctx.arc(48, 48, 32, 0, Math.PI * 2)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(2.4, 2.4, 1)
    return sprite
  }

  _clearGroup(group) {
    while (group.children.length > 0) {
      const obj = group.children[0]
      obj.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.map) m.map.dispose()
              m.dispose()
            })
          } else {
            if (child.material.map) child.material.map.dispose()
            child.material.dispose()
          }
        }
      })
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
    this.updateCameraPosition(true)
  }

  resetCamera() {
    this.cameraTarget.set(0, 0, 0)
    this.spherical.set(85, Math.PI / 3, Math.PI / 4)
    this.updateCameraPosition(true)
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate
    return this.autoRotate
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))

    if (this.autoRotate && !this.isDragging && !this.isPanning) {
      this.spherical.theta += 0.003
      this.updateCameraPosition(false)
    }

    const now = performance.now() * 0.004

    // Orienta halos de nós para a câmera e anima sutilmente os colares geométricos da aresta selecionada
    if (this.haloGroup.children.length > 0) {
      this.haloGroup.children.forEach(halo => {
        if (halo.userData?.isBillboardHalo) {
          halo.lookAt(this.camera.position)
        } else if (halo.userData?.isEdgeSelectionCollar) {
          const pulse = 1 + 0.1 * Math.sin(now + (halo.userData.phaseOffset || 0))
          halo.scale.set(pulse, pulse, 1)
        }
      })
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
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
    this._clearGroup(this.haloGroup)

    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer = null
    }

    this.scene = null
    this.camera = null
  }
}
