/* global Office */

import { swapPosition, swapHorizontal, swapVertical, swapCenter } from "../core/swapOperations";
import { alignLeft, alignRight, alignCenter, alignTop, alignBottom, alignMiddle } from "../core/alignOperations";
import { distributeHorizontal, distributeVertical } from "../core/distributeOperations";

Office.onReady(() => {
  // Office.js runtime is ready
});

/**
 * Wraps an async shape operation for use as an ExecuteFunction ribbon command.
 * Ensures event.completed() is always called, even on error.
 */
function wrapCommand(
  operation: () => Promise<void>
): (event: Office.AddinCommands.Event) => void {
  return async (event: Office.AddinCommands.Event) => {
    try {
      await operation();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Strategy Tools command error:", message);
    }
    event.completed();
  };
}

// Register swap commands
Office.actions.associate("swapPosition", wrapCommand(swapPosition));
Office.actions.associate("swapHorizontal", wrapCommand(swapHorizontal));
Office.actions.associate("swapVertical", wrapCommand(swapVertical));
Office.actions.associate("swapCenter", wrapCommand(swapCenter));

// Register align commands
Office.actions.associate("alignLeft", wrapCommand(alignLeft));
Office.actions.associate("alignRight", wrapCommand(alignRight));
Office.actions.associate("alignCenter", wrapCommand(alignCenter));
Office.actions.associate("alignTop", wrapCommand(alignTop));
Office.actions.associate("alignBottom", wrapCommand(alignBottom));
Office.actions.associate("alignMiddle", wrapCommand(alignMiddle));

// Register distribute commands
Office.actions.associate("distributeHorizontal", wrapCommand(distributeHorizontal));
Office.actions.associate("distributeVertical", wrapCommand(distributeVertical));
