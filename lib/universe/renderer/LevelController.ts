import type { UniverseLevel, UniverseSnapshot } from '../../../types/universe'
import type { SceneContext } from './scenes/BaseLevelScene'
import { BaseLevelScene } from './scenes/BaseLevelScene'
import { EarthMoonScene, EarthScene, YouScene } from './scenes/EarthScenes'
import { SchematicScene } from './scenes/SchematicScene'
import { SolarSystemScene } from './scenes/SolarSystemScene'

export class LevelController {
  private readonly ctx: SceneContext
  private readonly parent: InstanceType<SceneContext['THREE']['Object3D']>
  private active: BaseLevelScene | null = null
  private level: UniverseLevel = 4

  constructor(
    ctx: SceneContext,
    parent: InstanceType<SceneContext['THREE']['Object3D']>
  ) {
    this.ctx = ctx
    this.parent = parent
  }

  get current(): BaseLevelScene | null {
    return this.active
  }

  get currentLevel(): UniverseLevel {
    return this.level
  }

  setLevel(level: UniverseLevel, snapshot: UniverseSnapshot | null): void {
    if (this.active) {
      this.parent.remove(this.active.root)
      this.active.dispose()
      this.active = null
    }
    this.level = level
    this.active = this.createScene(level)
    this.parent.add(this.active.root)
    if (snapshot) {
      this.active.sync(snapshot)
    }
  }

  sync(snapshot: UniverseSnapshot): void {
    this.active?.sync(snapshot)
  }

  dispose(): void {
    if (this.active) {
      this.parent.remove(this.active.root)
      this.active.dispose()
      this.active = null
    }
  }

  private createScene(level: UniverseLevel): BaseLevelScene {
    switch (level) {
      case 1:
        return new YouScene(this.ctx)
      case 2:
        return new EarthScene(this.ctx)
      case 3:
        return new EarthMoonScene(this.ctx)
      case 4:
        return new SolarSystemScene(this.ctx)
      default:
        return new SchematicScene(this.ctx, level)
    }
  }
}
