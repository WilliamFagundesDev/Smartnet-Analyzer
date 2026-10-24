/**
 * Utilitário de Layout Espacial 3D para Grafos
 * Implementa distribuição visual por simulação de forças (Force-Directed 3D)
 * para separar nós e criar visualizações equilibradas.
 * 
 * NOTA ACADÊMICA: Este layout é estritamente estético e visual.
 * Ele não altera a topologia matemática nem os resultados de DFS, BFS, Dijkstra ou Kruskal.
 */
export function applyForceLayout3D(graph, iterations = 60) {
  if (!graph || graph.vertices.length <= 1) return

  const vertices = graph.vertices
  const edges = graph.edges
  const k = 22 // Distância ideal de repouso entre nós
  const repulsionStrength = 800
  const attractionStrength = 0.08
  const damping = 0.88

  // Inicializa velocidades
  const velocities = new Map()
  vertices.forEach(v => {
    velocities.set(v.id, { x: 0, y: 0, z: 0 })
    if (v.x === undefined) v.x = (Math.random() - 0.5) * 40
    if (v.y === undefined) v.y = (Math.random() - 0.5) * 40
    if (v.z === undefined) v.z = (Math.random() - 0.5) * 40
  })

  for (let iter = 0; iter < iterations; iter++) {
    // 1. Repulsão entre todos os pares (Lei de Coulomb)
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i]
      for (let j = i + 1; j < vertices.length; j++) {
        const v2 = vertices[j]
        let dx = v1.x - v2.x
        let dy = v1.y - v2.y
        let dz = v1.z - v2.z
        let dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1

        if (dist < 80) {
          const force = repulsionStrength / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          const fz = (dz / dist) * force

          const vel1 = velocities.get(v1.id)
          const vel2 = velocities.get(v2.id)

          vel1.x += fx
          vel1.y += fy
          vel1.z += fz

          vel2.x -= fx
          vel2.y -= fy
          vel2.z -= fz
        }
      }
    }

    // 2. Atração ao longo das arestas (Lei de Hooke)
    for (const edge of edges) {
      const v1 = graph.getVertex(edge.source)
      const v2 = graph.getVertex(edge.target)
      if (!v1 || !v2) continue

      let dx = v2.x - v1.x
      let dy = v2.y - v1.y
      let dz = v2.z - v1.z
      let dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1

      const force = (dist - k) * attractionStrength
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      const fz = (dz / dist) * force

      const vel1 = velocities.get(v1.id)
      const vel2 = velocities.get(v2.id)

      vel1.x += fx
      vel1.y += fy
      vel1.z += fz

      vel2.x -= fx
      vel2.y -= fy
      vel2.z -= fz
    }

    // 3. Força centrípeta suave para manter o grafo centralizado
    for (const v of vertices) {
      const vel = velocities.get(v.id)
      vel.x -= v.x * 0.015
      vel.y -= v.y * 0.015
      vel.z -= v.z * 0.015

      // Aplicação com amortecimento
      v.x += vel.x * damping
      v.y += vel.y * damping
      v.z += vel.z * damping

      vel.x *= damping
      vel.y *= damping
      vel.z *= damping
    }
  }

  // Arredonda posições
  vertices.forEach(v => {
    v.x = Number(v.x.toFixed(2))
    v.y = Number(v.y.toFixed(2))
    v.z = Number(v.z.toFixed(2))
  })
}
