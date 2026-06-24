'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

interface Agent {
  name: string
  displayName: string
  emoji: string
  color: string
  isActive: boolean
  actionsToday: number
}

interface OfficeGameProps {
  agents: Agent[]
}

// Couleurs premium pour le branding
const COLORS = {
  background: 0x0f172a, // Bleu nuit profond
  floor: 0x1e293b, // Slate-800
  wall: 0x334155, // Slate-700
  desk: 0x475569, // Slate-600
  screen: 0x7c3aed, // Violet premium
  screenGlow: 0xa855f7, // Violet light
  gold: 0xfbbf24, // Or premium
  playerPrimary: 0x3b82f6, // Bleu player
  white: 0xf8fafc,
}

class OfficeScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private agents: Agent[] = []
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private playerSpeed = 200

  constructor() {
    super({ key: 'OfficeScene' })
  }

  init(data: { agents: Agent[] }) {
    this.agents = data.agents
  }

  preload() {
    // Créer les sprites pixel art dynamiquement
    this.createPixelArtAssets()
  }

  createPixelArtAssets() {
    // Créer le sprite du joueur (16x24 pixels)
    const playerGraphics = this.add.graphics()

    // Tête
    playerGraphics.fillStyle(0xffdbac, 1)
    playerGraphics.fillRect(4, 0, 8, 8)

    // Yeux
    playerGraphics.fillStyle(0x000000, 1)
    playerGraphics.fillRect(5, 3, 2, 2)
    playerGraphics.fillRect(9, 3, 2, 2)

    // Corps (costume bleu premium)
    playerGraphics.fillStyle(COLORS.playerPrimary, 1)
    playerGraphics.fillRect(3, 8, 10, 10)

    // Cravate dorée
    playerGraphics.fillStyle(COLORS.gold, 1)
    playerGraphics.fillRect(7, 8, 2, 6)

    // Jambes
    playerGraphics.fillStyle(0x1e293b, 1)
    playerGraphics.fillRect(4, 18, 3, 6)
    playerGraphics.fillRect(9, 18, 3, 6)

    playerGraphics.generateTexture('player', 16, 24)
    playerGraphics.destroy()

    // Créer le sprite de l'agent (16x24 pixels)
    const agentGraphics = this.add.graphics()

    // Tête
    agentGraphics.fillStyle(0xffdbac, 1)
    agentGraphics.fillRect(4, 0, 8, 8)

    // Yeux
    agentGraphics.fillStyle(0x000000, 1)
    agentGraphics.fillRect(5, 3, 2, 2)
    agentGraphics.fillRect(9, 3, 2, 2)

    // Corps (chemise blanche)
    agentGraphics.fillStyle(COLORS.white, 1)
    agentGraphics.fillRect(3, 8, 10, 10)

    // Cravate
    agentGraphics.fillStyle(COLORS.screen, 1)
    agentGraphics.fillRect(7, 8, 2, 6)

    // Jambes
    agentGraphics.fillStyle(0x334155, 1)
    agentGraphics.fillRect(4, 18, 3, 6)
    agentGraphics.fillRect(9, 18, 3, 6)

    agentGraphics.generateTexture('agent', 16, 24)
    agentGraphics.destroy()

    // Créer le bureau (48x32 pixels)
    const deskGraphics = this.add.graphics()

    // Plateau du bureau
    deskGraphics.fillStyle(COLORS.desk, 1)
    deskGraphics.fillRect(0, 0, 48, 24)

    // Ombrage
    deskGraphics.fillStyle(0x334155, 1)
    deskGraphics.fillRect(0, 20, 48, 4)

    // Pieds
    deskGraphics.fillStyle(0x1e293b, 1)
    deskGraphics.fillRect(4, 24, 6, 8)
    deskGraphics.fillRect(38, 24, 6, 8)

    deskGraphics.generateTexture('desk', 48, 32)
    deskGraphics.destroy()

    // Créer l'écran d'ordinateur (24x20 pixels)
    const screenGraphics = this.add.graphics()

    // Cadre
    screenGraphics.fillStyle(0x1e293b, 1)
    screenGraphics.fillRect(0, 0, 24, 20)

    // Écran (on va animer ça)
    screenGraphics.fillStyle(COLORS.screen, 1)
    screenGraphics.fillRect(2, 2, 20, 14)

    // Glow effect
    screenGraphics.fillStyle(COLORS.screenGlow, 0.3)
    screenGraphics.fillRect(1, 1, 22, 16)

    // Pied
    screenGraphics.fillStyle(0x334155, 1)
    screenGraphics.fillRect(10, 16, 4, 4)

    screenGraphics.generateTexture('screen', 24, 20)
    screenGraphics.destroy()
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background avec effet de profondeur
    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0, 0)

    // Sol en damier pixel art
    for (let x = 0; x < width; x += 32) {
      for (let y = height - 200; y < height; y += 32) {
        const shade = ((x + y) / 32) % 2 === 0 ? COLORS.floor : 0x293548
        this.add.rectangle(x, y, 32, 32, shade).setOrigin(0, 0)
      }
    }

    // Créer les postes de travail pour les agents (2 rangées de 3)
    const positions = [
      { x: 150, y: 250 },
      { x: 350, y: 250 },
      { x: 550, y: 250 },
      { x: 150, y: 400 },
      { x: 350, y: 400 },
      { x: 550, y: 400 },
    ]

    this.agents.forEach((agent, index) => {
      if (index < positions.length) {
        this.createWorkstation(positions[index].x, positions[index].y, agent)
      }
    })

    // Créer le joueur au centre
    this.player = this.add.sprite(width / 2, height / 2, 'player')
    this.player.setScale(2) // Agrandir pour meilleure visibilité

    // Ajouter une ombre
    const shadow = this.add.ellipse(
      this.player.x,
      this.player.y + 24,
      16,
      8,
      0x000000,
      0.3
    )
    shadow.setDepth(-1)

    // Stocker l'ombre comme donnée du joueur pour la mettre à jour
    this.player.setData('shadow', shadow)

    // Contrôles clavier
    this.cursors = this.input.keyboard?.createCursorKeys()

    // Ajouter les touches WASD aussi
    if (this.input.keyboard) {
      this.input.keyboard.addKey('W')
      this.input.keyboard.addKey('A')
      this.input.keyboard.addKey('S')
      this.input.keyboard.addKey('D')
    }

    // Instructions
    const instructions = this.add.text(
      width / 2,
      30,
      '🎮 Utilisez les ← → ↑ ↓ ou WASD pour vous déplacer dans le bureau',
      {
        fontSize: '16px',
        color: '#fbbf24',
        fontFamily: 'monospace',
        backgroundColor: '#0f172a',
        padding: { x: 20, y: 10 },
      }
    )
    instructions.setOrigin(0.5, 0)
    instructions.setDepth(1000)

    // Animation de bienvenue
    this.tweens.add({
      targets: this.player,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 500,
      yoyo: true,
      ease: 'Bounce.easeOut',
    })
  }

  createWorkstation(x: number, y: number, agent: Agent) {
    const container = this.add.container(x, y)

    // Bureau
    const desk = this.add.sprite(0, 0, 'desk').setOrigin(0.5, 1)

    // Écran d'ordinateur
    const screen = this.add.sprite(0, -20, 'screen').setOrigin(0.5, 1)

    // Animation de l'écran (effet de typing)
    if (agent.isActive) {
      this.tweens.add({
        targets: screen,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    // Agent assis au bureau
    const agentSprite = this.add.sprite(0, -10, 'agent').setOrigin(0.5, 1)
    agentSprite.setScale(1.5)

    // Animation de typing (l'agent bouge)
    if (agent.isActive) {
      this.tweens.add({
        targets: agentSprite,
        y: -12,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    // Nom de l'agent au-dessus
    const nameText = this.add.text(0, -60, `${agent.emoji} ${agent.displayName}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: agent.isActive ? '#7c3aed' : '#475569',
      padding: { x: 6, y: 3 },
    })
    nameText.setOrigin(0.5, 0.5)

    // Badge d'activité
    if (agent.isActive) {
      const badge = this.add.circle(30, -50, 4, 0x22c55e)
      this.tweens.add({
        targets: badge,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
      })
      container.add(badge)
    }

    // Actions du jour
    const actionsText = this.add.text(0, -45, `${agent.actionsToday} actions`, {
      fontSize: '10px',
      color: '#fbbf24',
      fontFamily: 'monospace',
    })
    actionsText.setOrigin(0.5, 0.5)

    container.add([desk, screen, agentSprite, nameText, actionsText])
    this.agentSprites.set(agent.name, container)
  }

  update() {
    if (!this.player || !this.cursors) return

    const speed = this.playerSpeed
    let velocityX = 0
    let velocityY = 0

    // Gestion des contrôles
    const keyW = this.input.keyboard?.addKey('W')
    const keyA = this.input.keyboard?.addKey('A')
    const keyS = this.input.keyboard?.addKey('S')
    const keyD = this.input.keyboard?.addKey('D')

    if (this.cursors.left.isDown || keyA?.isDown) {
      velocityX = -speed
    } else if (this.cursors.right.isDown || keyD?.isDown) {
      velocityX = speed
    }

    if (this.cursors.up.isDown || keyW?.isDown) {
      velocityY = -speed
    } else if (this.cursors.down.isDown || keyS?.isDown) {
      velocityY = speed
    }

    // Normaliser la vitesse en diagonale
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707
      velocityY *= 0.707
    }

    // Appliquer le mouvement
    this.player.x += velocityX * (1 / 60)
    this.player.y += velocityY * (1 / 60)

    // Limites de la scène
    const padding = 50
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      padding,
      this.cameras.main.width - padding
    )
    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      padding,
      this.cameras.main.height - padding
    )

    // Mettre à jour l'ombre
    const shadow = this.player.getData('shadow')
    if (shadow) {
      shadow.x = this.player.x
      shadow.y = this.player.y + 24
    }

    // Animation de marche
    if (velocityX !== 0 || velocityY !== 0) {
      // Petit effet de balancement en marchant
      const walkCycle = Math.sin(Date.now() / 100) * 0.1
      this.player.setScale(2 + walkCycle, 2 - walkCycle)
    } else {
      this.player.setScale(2, 2)
    }
  }
}

export function OfficeGame({ agents }: OfficeGameProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      backgroundColor: '#0f172a',
      scene: OfficeScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      pixelArt: true, // Important pour le pixel art
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    phaserGameRef.current = new Phaser.Game(config)

    // Passer les agents à la scène
    phaserGameRef.current.scene.start('OfficeScene', { agents })

    return () => {
      phaserGameRef.current?.destroy(true)
      phaserGameRef.current = null
    }
  }, [agents])

  return (
    <div
      ref={gameRef}
      className="w-full h-full rounded-xl overflow-hidden border-4 border-violet-600 shadow-2xl shadow-violet-500/20"
      style={{
        imageRendering: 'pixelated', // Garder le pixel art net
      }}
    />
  )
}
