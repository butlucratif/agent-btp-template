'use client'

import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

interface Agent {
  name: string
  displayName: string
  emoji: string
  color: string
  isActive: boolean
  lastRun: Date | null
  nextRun: Date | null
  actionsToday: number
}

interface OfficeGameProps {
  agents: Agent[]
}

// Menu d'interaction avec un agent
interface InteractionMenuProps {
  agent: Agent | null
  onClose: () => void
  onAction: (action: string) => void
}

function InteractionMenu({ agent, onClose, onAction }: InteractionMenuProps) {
  if (!agent) return null

  const actions = [
    { id: 'report', label: '📊 Demander un rapport', color: '#3b82f6' },
    { id: 'pause', label: '⏸️ Mettre en pause', color: '#eab308' },
    { id: 'boost', label: '⚡ Travailler plus', color: '#22c55e' },
    { id: 'status', label: '💬 Voir le status', color: '#a78bfa' },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border-2 border-[#fbbf24] shadow-2xl shadow-[#fbbf24]/20 p-8 min-w-[400px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{agent.emoji}</span>
              <h2 className="text-2xl font-bold text-white">{agent.displayName}</h2>
            </div>
            <p className="text-sm text-[#a1a1aa] font-mono">{agent.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-[#111113]/50 rounded-lg p-4 border border-[#334155]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#64748b]">Status</span>
              <span className={`text-xs font-semibold ${agent.isActive ? 'text-[#22c55e]' : 'text-[#64748b]'}`}>
                {agent.isActive ? '🟢 Actif' : '⚪ Inactif'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#64748b]">Actions aujourd'hui</span>
              <span className="text-sm font-bold text-[#fbbf24]">{agent.actionsToday}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id)
                onClose()
              }}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                border: `2px solid ${action.color}40`,
                color: action.color,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-2 bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] rounded-lg transition-colors text-sm"
        >
          Fermer (Échap)
        </button>
      </div>
    </div>
  )
}

const COLORS = {
  background: 0x0a0118, // Violet très sombre Wall Street
  floor: 0x1e1b4b, // Parquet sombre
  wall: 0x1e293b, // Mur slate
  desk: 0x475569, // Bureau slate
  screen: 0x7c3aed, // Écran violet premium
  screenGlow: 0xa855f7, // Lueur violette
  gold: 0xfbbf24, // Or premium
  plant: 0x22c55e, // Vert plante
  window: 0x38bdf8, // Bleu ciel fenêtre
  playerPrimary: 0x3b82f6,
  white: 0xf8fafc,
}

class OfficeScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private agents: Agent[] = []
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private playerSpeed = 300
  private wasd?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private eKey?: Phaser.Input.Keyboard.Key
  private nearestAgent: Agent | null = null
  private interactionDistance = 80
  private onShowMenu?: (agent: Agent | null) => void
  private interactionIndicator?: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'OfficeScene' })
  }

  init(data: { agents: Agent[]; onShowMenu: (agent: Agent | null) => void }) {
    this.agents = data.agents || []
    this.onShowMenu = data.onShowMenu
  }

  create() {
    // Créer les sprites pixel art
    this.createPixelArtAssets()

    // Créer le décor Wall Street luxueux
    this.createLuxuryOffice()

    // Créer les workstations des agents (3x2 grid)
    this.createWorkstations()

    // Créer le joueur
    this.player = this.add.sprite(800, 700, 'player')
    this.player.setScale(2)
    this.player.setDepth(100)

    // Contrôles clavier
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)

    // Indicateur d'interaction
    this.createInteractionIndicator()

    // Caméra suit le joueur
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1)
  }

  createInteractionIndicator() {
    this.interactionIndicator = this.add.container(0, 0)
    this.interactionIndicator.setDepth(1000)
    this.interactionIndicator.setVisible(false)

    // Bulle de dialogue pixel art
    const bubble = this.add.graphics()
    bubble.fillStyle(0x1e293b, 0.95)
    bubble.fillRoundedRect(-50, -40, 100, 30, 8)
    bubble.lineStyle(2, 0xfbbf24, 1)
    bubble.strokeRoundedRect(-50, -40, 100, 30, 8)

    const text = this.add.text(0, -25, '[E] Interagir', {
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold',
    })
    text.setOrigin(0.5)

    this.interactionIndicator.add([bubble, text])
  }

  createPixelArtAssets() {
    // Joueur (16x24 pixels) - Costume premium
    const playerGraphics = this.add.graphics()
    playerGraphics.fillStyle(0xffdbac, 1)
    playerGraphics.fillRect(4, 0, 8, 8) // Tête
    playerGraphics.fillStyle(0x000000, 1)
    playerGraphics.fillRect(5, 3, 2, 2) // Œil gauche
    playerGraphics.fillRect(9, 3, 2, 2) // Œil droit
    playerGraphics.fillStyle(COLORS.playerPrimary, 1)
    playerGraphics.fillRect(3, 8, 10, 10) // Costume
    playerGraphics.fillStyle(COLORS.gold, 1)
    playerGraphics.fillRect(7, 8, 2, 6) // Cravate dorée
    playerGraphics.fillStyle(0x1e293b, 1)
    playerGraphics.fillRect(4, 18, 3, 6) // Jambe gauche
    playerGraphics.fillRect(9, 18, 3, 6) // Jambe droite
    playerGraphics.generateTexture('player', 16, 24)
    playerGraphics.destroy()

    // Agent (16x24 pixels)
    const agentGraphics = this.add.graphics()
    agentGraphics.fillStyle(0xffdbac, 1)
    agentGraphics.fillRect(4, 0, 8, 8)
    agentGraphics.fillStyle(0x000000, 1)
    agentGraphics.fillRect(5, 3, 2, 2)
    agentGraphics.fillRect(9, 3, 2, 2)
    agentGraphics.fillStyle(COLORS.white, 1)
    agentGraphics.fillRect(3, 8, 10, 10)
    agentGraphics.fillStyle(COLORS.screen, 1)
    agentGraphics.fillRect(7, 8, 2, 6)
    agentGraphics.fillStyle(0x334155, 1)
    agentGraphics.fillRect(4, 18, 3, 6)
    agentGraphics.fillRect(9, 18, 3, 6)
    agentGraphics.generateTexture('agent', 16, 24)
    agentGraphics.destroy()

    // Bureau premium (64x40 pixels) - Plus grand
    const deskGraphics = this.add.graphics()
    deskGraphics.fillStyle(COLORS.desk, 1)
    deskGraphics.fillRect(0, 0, 64, 32)
    deskGraphics.fillStyle(0x334155, 1)
    deskGraphics.fillRect(0, 28, 64, 4) // Ombrage
    deskGraphics.fillStyle(COLORS.gold, 0.3)
    deskGraphics.fillRect(2, 2, 60, 26) // Reflet doré
    deskGraphics.fillStyle(0x1e293b, 1)
    deskGraphics.fillRect(4, 32, 8, 8) // Pied gauche
    deskGraphics.fillRect(52, 32, 8, 8) // Pied droit
    deskGraphics.generateTexture('desk', 64, 40)
    deskGraphics.destroy()

    // Écran premium (32x28 pixels)
    const screenGraphics = this.add.graphics()
    screenGraphics.fillStyle(0x1e293b, 1)
    screenGraphics.fillRect(0, 0, 32, 24)
    screenGraphics.fillStyle(COLORS.screen, 1)
    screenGraphics.fillRect(2, 2, 28, 18)
    screenGraphics.fillStyle(COLORS.screenGlow, 0.4)
    screenGraphics.fillRect(1, 1, 30, 20) // Glow
    screenGraphics.fillStyle(COLORS.gold, 1)
    screenGraphics.fillRect(0, 0, 32, 2) // Bordure dorée haut
    screenGraphics.fillStyle(0x334155, 1)
    screenGraphics.fillRect(12, 20, 8, 8) // Pied
    screenGraphics.generateTexture('screen', 32, 28)
    screenGraphics.destroy()

    // Plante luxueuse (24x40 pixels)
    const plantGraphics = this.add.graphics()
    plantGraphics.fillStyle(0x92400e, 1)
    plantGraphics.fillRect(8, 28, 8, 12) // Pot
    plantGraphics.fillStyle(COLORS.gold, 0.3)
    plantGraphics.fillRect(9, 29, 6, 2) // Reflet doré pot
    plantGraphics.fillStyle(COLORS.plant, 1)
    plantGraphics.fillCircle(12, 20, 8) // Feuillage
    plantGraphics.fillCircle(8, 16, 6)
    plantGraphics.fillCircle(16, 16, 6)
    plantGraphics.fillCircle(12, 12, 7)
    plantGraphics.generateTexture('plant', 24, 40)
    plantGraphics.destroy()

    // Fenêtre avec vue NYC (80x120 pixels)
    const windowGraphics = this.add.graphics()
    windowGraphics.fillStyle(0x1e293b, 1)
    windowGraphics.fillRect(0, 0, 80, 120) // Cadre
    windowGraphics.fillStyle(COLORS.window, 0.6)
    windowGraphics.fillRect(4, 4, 72, 112) // Vitre
    // Gratte-ciels simplifiés
    windowGraphics.fillStyle(0x0f172a, 0.5)
    windowGraphics.fillRect(8, 60, 16, 52)
    windowGraphics.fillRect(28, 40, 20, 72)
    windowGraphics.fillRect(52, 50, 16, 62)
    // Reflets dorés
    windowGraphics.fillStyle(COLORS.gold, 0.2)
    windowGraphics.fillRect(4, 4, 72, 20)
    windowGraphics.fillStyle(0xfef3c7, 1)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 10; j++) {
        if (Math.random() > 0.5) {
          windowGraphics.fillRect(8 + i * 14, 40 + j * 8, 2, 2) // Fenêtres buildings
        }
      }
    }
    windowGraphics.generateTexture('window', 80, 120)
    windowGraphics.destroy()
  }

  createLuxuryOffice() {
    const width = 1600
    const height = 900

    // Sol parquet luxueux avec motif
    const floorGraphics = this.add.graphics()
    floorGraphics.fillStyle(COLORS.floor, 1)
    floorGraphics.fillRect(0, 0, width, height)

    // Motif parquet
    for (let x = 0; x < width; x += 64) {
      for (let y = 0; y < height; y += 32) {
        floorGraphics.fillStyle(0x1e1b4b, ((x + y) % 2 === 0) ? 1 : 0.95)
        floorGraphics.fillRect(x, y, 64, 32)
        floorGraphics.lineStyle(1, 0x0a0118, 0.3)
        floorGraphics.strokeRect(x, y, 64, 32)
      }
    }
    floorGraphics.setDepth(0)

    // Mur du fond avec fenêtres
    const wallGraphics = this.add.graphics()
    wallGraphics.fillStyle(COLORS.wall, 1)
    wallGraphics.fillRect(0, 0, width, 200)
    wallGraphics.setDepth(1)

    // Grandes fenêtres Wall Street
    const windowPositions = [200, 500, 800, 1100, 1400]
    windowPositions.forEach((x) => {
      const window = this.add.sprite(x, 100, 'window')
      window.setScale(1.2)
      window.setDepth(2)
      window.setAlpha(0.9)
    })

    // Plantes luxueuses dans les coins
    const plantPositions = [
      { x: 100, y: 150 },
      { x: width - 100, y: 150 },
      { x: 100, y: height - 100 },
      { x: width - 100, y: height - 100 },
    ]
    plantPositions.forEach((pos) => {
      const plant = this.add.sprite(pos.x, pos.y, 'plant')
      plant.setScale(2)
      plant.setDepth(3)
    })

    // Tapis premium sous la zone de travail (zone centrale)
    const carpetGraphics = this.add.graphics()
    carpetGraphics.fillStyle(0x7c3aed, 0.15)
    carpetGraphics.fillRect(200, 250, 1200, 500)
    carpetGraphics.lineStyle(4, COLORS.gold, 0.3)
    carpetGraphics.strokeRect(200, 250, 1200, 500)
    carpetGraphics.setDepth(1)
  }

  createWorkstations() {
    const positions = [
      { x: 400, y: 350 },
      { x: 800, y: 350 },
      { x: 1200, y: 350 },
      { x: 400, y: 600 },
      { x: 800, y: 600 },
      { x: 1200, y: 600 },
    ]

    this.agents.slice(0, 6).forEach((agent, index) => {
      if (!positions[index]) return

      const { x, y } = positions[index]
      const container = this.add.container(x, y)
      container.setDepth(50)

      // Bureau
      const desk = this.add.sprite(0, 0, 'desk')
      desk.setScale(1.5)
      container.add(desk)

      // Écran sur le bureau
      const screen = this.add.sprite(0, -25, 'screen')
      screen.setScale(1.5)
      container.add(screen)

      // Agent assis devant
      const agentSprite = this.add.sprite(0, 20, 'agent')
      agentSprite.setScale(2)
      container.add(agentSprite)

      // Badge nom avec emoji
      const badgeGraphics = this.add.graphics()
      badgeGraphics.fillStyle(0x1e293b, 0.9)
      badgeGraphics.fillRoundedRect(-60, -60, 120, 24, 8)
      badgeGraphics.lineStyle(2, parseInt(agent.color.replace('#', '0x')), 1)
      badgeGraphics.strokeRoundedRect(-60, -60, 120, 24, 8)
      container.add(badgeGraphics)

      const nameText = this.add.text(0, -48, `${agent.emoji} ${agent.displayName}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      nameText.setOrigin(0.5)
      container.add(nameText)

      // Indicateur d'activité
      if (agent.isActive) {
        const activityIndicator = this.add.circle(55, -55, 4, 0x22c55e)
        activityIndicator.setAlpha(0.8)
        container.add(activityIndicator)

        // Animation pulsation
        this.tweens.add({
          targets: activityIndicator,
          alpha: 0.3,
          scale: 1.5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
        })
      }

      // Animation typing pour l'agent
      this.tweens.add({
        targets: agentSprite,
        y: 22,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      // Stocker le container
      this.agentSprites.set(agent.name, container)
      ;(container as any).agentData = agent
    })
  }

  update() {
    if (!this.player || !this.cursors || !this.wasd) return

    let velocityX = 0
    let velocityY = 0

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.playerSpeed
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.playerSpeed
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -this.playerSpeed
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = this.playerSpeed
    }

    this.player.x += velocityX * (1 / 60)
    this.player.y += velocityY * (1 / 60)

    // Vérifier la proximité avec les agents
    this.checkAgentProximity()

    // Interaction avec E
    if (Phaser.Input.Keyboard.JustDown(this.eKey!) && this.nearestAgent && this.onShowMenu) {
      this.onShowMenu(this.nearestAgent)
    }
  }

  checkAgentProximity() {
    if (!this.player) return

    let closestAgent: Agent | null = null
    let closestDistance = this.interactionDistance

    this.agentSprites.forEach((container, agentName) => {
      const agent = (container as any).agentData as Agent
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        container.x,
        container.y
      )

      if (distance < closestDistance) {
        closestAgent = agent
        closestDistance = distance
      }
    })

    this.nearestAgent = closestAgent

    if (this.nearestAgent !== null && this.interactionIndicator) {
      const nearestAgent: Agent = this.nearestAgent
      const container = this.agentSprites.get(nearestAgent.name)
      if (container) {
        this.interactionIndicator.setPosition(container.x, container.y - 90)
        this.interactionIndicator.setVisible(true)
      }
    } else if (this.interactionIndicator) {
      this.interactionIndicator.setVisible(false)
    }
  }
}

export function OfficeGame({ agents }: OfficeGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1600,
      height: 900,
      backgroundColor: '#0a0118',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: OfficeScene,
    }

    gameRef.current = new Phaser.Game(config)
    gameRef.current.scene.start('OfficeScene', {
      agents,
      onShowMenu: setSelectedAgent,
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [agents])

  const handleAction = (action: string) => {
    if (!selectedAgent) return

    console.log(`Action ${action} sur agent ${selectedAgent.name}`)

    // TODO: Intégrer avec votre API backend
    switch (action) {
      case 'report':
        alert(`Rapport demandé pour ${selectedAgent.displayName}`)
        break
      case 'pause':
        alert(`${selectedAgent.displayName} mis en pause`)
        break
      case 'boost':
        alert(`${selectedAgent.displayName} activé en mode boost!`)
        break
      case 'status':
        alert(`Status: ${selectedAgent.isActive ? 'Actif' : 'Inactif'} - ${selectedAgent.actionsToday} actions`)
        break
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {selectedAgent && (
        <InteractionMenu
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
