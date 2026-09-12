import React, { useEffect, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { coreSchemes } from './figures/core';
import { foundationSchemes } from './figures/foundation';
import { foundationBSchemes } from './figures/foundationB';
import { advancedSchemes } from './figures/advanced';
import { mobileSchemes } from './figures/mobile';
import { blockchainSchemes } from './figures/blockchain';
import { repoAnatomySchemes } from './figures/repoAnatomy';
import { ciSchemes } from './figures/ci';
import { reviewSchemes } from './figures/review';
import { finalSchemes } from './figures/final';
import { editorSchemes } from './figures/editor';
import { codeBasicsSchemes } from './figures/codeBasics';
import { oopSchemes } from './figures/oop';
import { kotlinJavaSchemes } from './figures/kotlinJava';
import { kotlinFlowSchemes } from './figures/kotlinFlow';
import { kotlinOopSchemes } from './figures/kotlinOop';
import { kotlinHistorySchemes } from './figures/kotlinHistory';
import { kotlinCoroutinesSchemes } from './figures/kotlinCoroutines';
import { flowStreamsSchemes } from './figures/flowStreams';
import { lazyListsSchemes } from './figures/lazyLists';
import { materialThemeSchemes } from './figures/materialTheme';
import { scaffoldBarsSchemes } from './figures/scaffoldBars';
import { viewModelStateSchemes } from './figures/viewModelState';
import { appLayersSchemes } from './figures/appLayers';
import { networkLayerSchemes } from './figures/networkLayer';
import { networkErrorsSchemes } from './figures/networkErrors';
import { dataStorageSchemes } from './figures/dataStorage';
import { cleanCodeSchemes } from './figures/cleanCode';
import { cacheOfflineSchemes } from './figures/cacheOffline';
import { authSessionSchemes } from './figures/authSession';
import { deviceFeaturesSchemes } from './figures/deviceFeatures';
import { testingMobileSchemes } from './figures/testingMobile';
import { solidityHelloSchemes } from './figures/solidityHello';
import { solidityTypesSchemes } from './figures/solidityTypes';
import { solidityErrorsSchemes } from './figures/solidityErrors';
import { solidityFlowSchemes } from './figures/solidityFlow';
import { solidityFunctionsSchemes } from './figures/solidityFunctions';
import { solidityStorageSchemes } from './figures/solidityStorage';
import { solContractsOopSchemes } from './figures/solContractsOop';
import { solInheritanceSchemes } from './figures/solInheritance';
import { solInterfacesSchemes } from './figures/solInterfaces';
import { solLibrariesSchemes } from './figures/solLibraries';
import { solPatternsSchemes } from './figures/solPatterns';
import { erc20ScratchSchemes } from './figures/erc20Scratch';
import { erc20OzSchemes } from './figures/erc20Oz';
import { erc4626Schemes } from './figures/erc4626';
import { proxyUpgradeSchemes } from './figures/proxyUpgrade';
import { tsRunSchemes } from './figures/tsRun';
import { tsNullSchemes } from './figures/tsNull';
import { tsTypesSchemes } from './figures/tsTypes';
import { tsErrorsSchemes } from './figures/tsErrors';
import { tsAsyncNetSchemes } from './figures/tsAsyncNet';
import { tsModulesSchemes } from './figures/tsModules';
import { kotlinNullSchemes } from './figures/kotlinNull';
import { tsJsSchemes } from './figures/tsJs';
import { tsValuesSchemes } from './figures/tsValues';
import { tsFlowSchemes } from './figures/tsFlow';
import { tsFunctionsSchemes } from './figures/tsFunctions';
import { tsCollectionsSchemes } from './figures/tsCollections';
import { tsOopSchemes } from './figures/tsOop';
import { tsHistorySchemes } from './figures/tsHistory';
import { tsAsyncSchemes } from './figures/tsAsync';
import { gethNetworkSchemes } from './figures/gethNetwork';
import { hardhatStartSchemes } from './figures/hardhatStart';
import { hardhatConfigSchemes } from './figures/hardhatConfig';
import { hardhatTestSchemes } from './figures/hardhatTest';
import { hardhatDeploySchemes } from './figures/hardhatDeploy';
import { webHtmlSchemes } from './figures/webHtml';
import { webCssSchemes } from './figures/webCss';
import { webLayoutSchemes } from './figures/webLayout';
import { webDomSchemes } from './figures/webDom';
import { webReactSchemes } from './figures/webReact';
import { webStateSchemes } from './figures/webState';
import { webViteSchemes } from './figures/webVite';
import { webFetchSchemes } from './figures/webFetch';
import { webFormsSchemes } from './figures/webForms';
import { webRouterSchemes } from './figures/webRouter';
import { webReduxSchemes } from './figures/webRedux';
import { webRtkSchemes } from './figures/webRtk';
import { webRtkAsyncSchemes } from './figures/webRtkAsync';
import { walletConnectSchemes } from './figures/walletConnect';
import { walletSignSchemes } from './figures/walletSign';
import { dappFullSchemes } from './figures/dappFull';
import { auditVulnsSchemes } from './figures/auditVulns';
import { auditToolsSchemes } from './figures/auditTools';
import { auditReportSchemes } from './figures/auditReport';
import { fabricIntroSchemes } from './figures/fabricIntro';
import { fabricNetworkSchemes } from './figures/fabricNetwork';
import { fabricChaincodeSchemes } from './figures/fabricChaincode';
import { fabricLifecycleSchemes } from './figures/fabricLifecycle';
import { fabricTxSchemes } from './figures/fabricTx';
import { fabricVsEthSchemes } from './figures/fabricVsEth';
import { wavesAccountSchemes } from './figures/wavesAccount';
import { wavesTxSchemes } from './figures/wavesTx';
import { wavesDataSchemes } from './figures/wavesData';
import { wavesAssetsSchemes } from './figures/wavesAssets';
import { wavesRideSchemes } from './figures/wavesRide';
import { wavesSmartAccountSchemes } from './figures/wavesSmartAccount';
import { wavesDappSchemes } from './figures/wavesDapp';
import { wavesPaymentsSchemes } from './figures/wavesPayments';
import { wavesClientSchemes } from './figures/wavesClient';
import { sdachaRepoSchemes } from './figures/sdachaRepo';
import { demoShowSchemes } from './figures/demoShow';
import { layoutCardSchemes } from './figures/layoutCard';
import { sprintFlowSchemes } from './figures/sprintFlow';
import { kitButtonsSchemes } from './figures/kitButtons';
import { kitInputsSchemes } from './figures/kitInputs';
import { kitSelectSchemes } from './figures/kitSelect';
import { kitSearchSchemes } from './figures/kitSearch';
import './trainers.css';

/* Иллюстрация с подписью. Сами схемы живут в figures/ по трекам — так над
 * картинками разных глав можно работать параллельно, не толкаясь в одном файле. */

const SCHEMES = {
  ...coreSchemes,
  ...foundationSchemes,
  ...foundationBSchemes,
  ...advancedSchemes,
  ...mobileSchemes,
  ...blockchainSchemes,
  ...repoAnatomySchemes,
  ...ciSchemes,
  ...reviewSchemes,
  ...finalSchemes,
  ...editorSchemes,
  ...codeBasicsSchemes,
  ...oopSchemes,
  ...kotlinJavaSchemes,
  ...kotlinFlowSchemes,
  ...kotlinOopSchemes,
  ...kotlinHistorySchemes,
  ...kotlinCoroutinesSchemes,
  ...flowStreamsSchemes,
  ...lazyListsSchemes,
  ...materialThemeSchemes,
  ...scaffoldBarsSchemes,
  ...viewModelStateSchemes,
  ...appLayersSchemes,
  ...networkLayerSchemes,
  ...networkErrorsSchemes,
  ...dataStorageSchemes,
  ...cleanCodeSchemes,
  ...cacheOfflineSchemes,
  ...authSessionSchemes,
  ...deviceFeaturesSchemes,
  ...testingMobileSchemes,
  ...solidityHelloSchemes,
  ...solidityTypesSchemes,
  ...solidityErrorsSchemes,
  ...solidityFlowSchemes,
  ...solidityFunctionsSchemes,
  ...solidityStorageSchemes,
  ...solContractsOopSchemes,
  ...solInheritanceSchemes,
  ...solInterfacesSchemes,
  ...solLibrariesSchemes,
  ...solPatternsSchemes,
  ...erc20ScratchSchemes,
  ...erc20OzSchemes,
  ...erc4626Schemes,
  ...proxyUpgradeSchemes,
  ...tsRunSchemes,
  ...tsNullSchemes,
  ...tsTypesSchemes,
  ...tsErrorsSchemes,
  ...tsAsyncNetSchemes,
  ...tsModulesSchemes,
  ...gethNetworkSchemes,
  ...hardhatStartSchemes,
  ...hardhatConfigSchemes,
  ...hardhatTestSchemes,
  ...hardhatDeploySchemes,
  ...webHtmlSchemes,
  ...webCssSchemes,
  ...webLayoutSchemes,
  ...webDomSchemes,
  ...webReactSchemes,
  ...webStateSchemes,
  ...webViteSchemes,
  ...webFetchSchemes,
  ...webFormsSchemes,
  ...webRouterSchemes,
  ...webReduxSchemes,
  ...webRtkSchemes,
  ...webRtkAsyncSchemes,
  ...walletConnectSchemes,
  ...walletSignSchemes,
  ...dappFullSchemes,
  ...auditVulnsSchemes,
  ...auditToolsSchemes,
  ...auditReportSchemes,
  ...fabricIntroSchemes,
  ...fabricNetworkSchemes,
  ...fabricChaincodeSchemes,
  ...fabricLifecycleSchemes,
  ...fabricTxSchemes,
  ...fabricVsEthSchemes,
  ...wavesAccountSchemes,
  ...wavesTxSchemes,
  ...wavesDataSchemes,
  ...wavesAssetsSchemes,
  ...wavesRideSchemes,
  ...wavesSmartAccountSchemes,
  ...wavesDappSchemes,
  ...wavesPaymentsSchemes,
  ...wavesClientSchemes,
  ...sdachaRepoSchemes,
  ...demoShowSchemes,
  ...layoutCardSchemes,
  ...sprintFlowSchemes,
  ...kitButtonsSchemes,
  ...kitInputsSchemes,
  ...kitSelectSchemes,
  ...kitSearchSchemes,
  ...kotlinNullSchemes,
  ...tsJsSchemes,
  ...tsValuesSchemes,
  ...tsFlowSchemes,
  ...tsFunctionsSchemes,
  ...tsCollectionsSchemes,
  ...tsOopSchemes,
  ...tsHistorySchemes,
  ...tsAsyncSchemes,
};

export const SCHEME_IDS = Object.keys(SCHEMES);

export default function Figure({
  scheme, img, alt, caption, source, children,
}: {
  /** id встроенной SVG-схемы (стиль обложек) */
  scheme?: string;
  /** путь к картинке в static, например /img/photos/typing.jpg */
  img?: string;
  alt?: string;
  caption: string;
  /** источник/лицензия для фото */
  source?: string;
  children?: React.ReactNode;
}) {
  const imgUrl = useBaseUrl(img ?? '/');
  const ref = useRef<HTMLElement | null>(null);

  // Появление иллюстрации при подходе к ней. Класс вешает JS, поэтому без
  // скриптов и при отключённой анимации картинка просто видна сразу —
  // прятать её css-ом «на всякий случай» нельзя, это скроет контент.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    el.classList.add('fig-hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('fig-shown');
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="fig" ref={ref}>
      <div className="fig-media">
        {scheme && SCHEMES[scheme] ? SCHEMES[scheme](caption) : null}
        {img ? <img src={imgUrl} alt={alt ?? caption} loading="lazy" /> : null}
        {children}
      </div>
      <figcaption className="fig-caption">
        {caption}
        {source ? <span className="fig-source">{source}</span> : null}
      </figcaption>
    </figure>
  );
}
