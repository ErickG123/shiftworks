import './styles/main.css';
import { SceneManager } from './game/rendering/scene-manager';
import { mountStatusPage } from './status';
import { EditorController } from './game/editor/editor-controller';
import { SimulationController } from './game/simulation/simulation-controller';
import { NavigationController } from './game/ui/navigation-controller';

const app = document.querySelector<HTMLElement>('#app');
const canvas = document.querySelector<HTMLCanvasElement>('#factory-canvas');

if (app && canvas) {
  try {
    let editor: EditorController | null = null;
    const sceneManager = new SceneManager({
      canvas,
      selectedCellOutput: document.querySelector<HTMLOutputElement>('#selected-cell'),
      onCellHover: (cell) => editor?.onHover(cell),
      onCellClick: (cell) => editor?.onClick(cell),
      onFrame: (time) => editor?.animate(time),
    });
    editor = new EditorController(sceneManager);
    const simulationController = new SimulationController(sceneManager, editor);
    new NavigationController(app, editor);
    sceneManager.start();
    mountStatusPage(app, true);
    window.addEventListener('pagehide', () => { simulationController.dispose(); editor?.dispose(); sceneManager.dispose(); }, { once: true });
  } catch {
    mountStatusPage(app, false);
  }
} else if (app) {
  mountStatusPage(app, false);
}
