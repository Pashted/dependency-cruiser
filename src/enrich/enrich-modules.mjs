import deriveCycles from "./derive/circular.mjs";
import deriveOrphans from "./derive/orphan/index.mjs";
import addDependents from "./derive/dependents/index.mjs";
import deriveReachable from "./derive/reachable.mjs";
import addValidations from "./add-validations.mjs";
import softenKnownViolations from "./soften-known-violations.mjs";
import deriveModuleMetrics from "./derive/metrics/index.mjs";
import IndexedModuleGraph from "#graph-utl/indexed-module-graph.mjs";
import addFocus from "#graph-utl/add-focus.mjs";
import { bus } from "#utl/bus.mjs";

/** @import { IModule, IOptions } from "../../types/dependency-cruiser.mjs" */

/**
 * @param {IModule[]} pModules
 * @param {IOptions} pOptions
 * @returns {IModule[]}
 */
export default function enrichModules(pModules, pOptions) {
  bus.info("analyzing: cycles");
  const lIndexedModules = new IndexedModuleGraph(pModules);
  let lModules = deriveCycles(pModules, lIndexedModules, {
    pSourceAttribute: "source",
    pDependencyName: "resolved",
    pSkipAnalysisNotInRules: pOptions.skipAnalysisNotInRules,
    pRuleSet: pOptions.ruleSet,
  });
  bus.info("analyzing: dependents");
  lModules = addDependents(lModules, pOptions);
  bus.info("analyzing: orphans");
  lModules = deriveOrphans(lModules, pOptions);
  bus.info("analyzing: reachables");
  lModules = deriveReachable(lModules, pOptions.ruleSet);
  bus.info("analyzing: module metrics");
  lModules = deriveModuleMetrics(lModules, pOptions);
  bus.info("analyzing: focus");
  lModules = addFocus(lModules, pOptions.focus);

  // when validate === false we might want to skip the addValidations.
  // We don't at this time, however, as "valid" is a mandatory
  // attribute (to simplify reporter logic)
  bus.info("analyzing: validations");
  lModules = addValidations(lModules, pOptions.ruleSet, pOptions.validate);

  lModules = softenKnownViolations(lModules, pOptions.knownViolations);

  return lModules;
}
