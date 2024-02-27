import {each, indexOf, isArray, isFunction} from "zrender/lib/core/util";
import {registerPainter} from "zrender/lib/zrender";

const extensionRegisters = {
  registerPainter
}

const extensions: (EChartsExtensionInstaller | EChartsExtension)[] = [];

export type EChartsExtensionInstallRegisters = typeof extensionRegisters;

export type EChartsExtensionInstaller = (ec: EChartsExtensionInstallRegisters) => void;

export interface EChartsExtension {
  install: EChartsExtensionInstaller
}
export function useSetupRenderer (
  ext: EChartsExtensionInstaller | EChartsExtension | (EChartsExtensionInstaller | EChartsExtension)[]
) {
  if (isArray(ext)) {
    // use([ChartLine, ChartBar]);
    each(ext, (singleExt) => {
      useSetupRenderer(singleExt);
    });
    return;
  }

  if (indexOf(extensions, ext) >= 0) {
    return;
  }
  extensions.push(ext);

  if (isFunction(ext)) {
    ext = {
      install: ext
    };
  }
  ext.install(extensionRegisters);
}