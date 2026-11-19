import { SceneManager } from './game/rendering/scene-manager';
import { MenuDiorama } from './game/rendering/menu-diorama';
import { EquipmentPreviewCard } from './game/rendering/equipment-preview-card';
import { mountStatusPage } from './status';
import { EditorController } from './game/editor/editor-controller';
import { SimulationController } from './game/simulation/simulation-controller';
import { NavigationController } from './game/ui/navigation-controller';

const app = document.querySelector<HTMLElement>('#app');
const canvas = document.querySelector<HTMLCanvasElement>('#factory-canvas');

if (app && canvas) {
  try {
    let editor: EditorController | null = null;
    let menuDiorama: MenuDiorama | null = null;
    const sceneManager = new SceneManager({
      canvas,
      selectedCellOutput: document.querySelector<HTMLOutputElement>('#selected-cell'),
      onCellHover: (cell) => {
        if (!menuDiorama?.isActive()) editor?.onHover(cell);
      },
      onCellClick: (cell) => {
        if (!menuDiorama?.isActive()) editor?.onClick(cell);
      },
      onFrame: (time) => {
        if (menuDiorama?.isActive()) {
          menuDiorama.animate(time);
        } else {
          editor?.animate(time);
        }
      },
    });
    editor = new EditorController(sceneManager);
    const equipmentPreview = new EquipmentPreviewCard(app);
    editor.setEquipmentPreviewHandler((type, invoker) => {
      equipmentPreview.open(type, invoker);
    });
    const simulationController = new SimulationController(sceneManager, editor);
    menuDiorama = new MenuDiorama(sceneManager);
    const navigationController = new NavigationController(
      app,
      editor,
      simulationController,
      menuDiorama,
    );
    sceneManager.start();
    mountStatusPage(app, true);
    window.addEventListener(
      'pagehide',
      () => {
        equipmentPreview.dispose();
        navigationController.dispose();
        simulationController.dispose();
        editor?.dispose();
        sceneManager.dispose();
      },
      { once: true },
    );
  } catch {
    mountStatusPage(app, false);
  }
} else if (app) {
  mountStatusPage(app, false);
}
