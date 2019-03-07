// convert moses options and additional parameters objects to an option string
export function stringifyMosesOptions(mosesOptions, additionalParameters) {
  const options = Object.assign({}, mosesOptions);
  // if enable feature selection is disabled, remove options related to it
  if (!options.enableFeatureSelection) {
    delete options.featureSelectionAlgorithm;
    delete options.featureSelectionTargetSize;
  }
  // if hcWidenSearch is disabled, remove options related to it
  if (!options.hcWidenSearch) {
    delete options.hcCrossoverMinNeighbors;
    delete options.hcCrossoverPopSize;
  }

  let optionsString = Object.keys(options).reduce((accumulator, key) => {
    return (accumulator += ` ${
      MosesOptionsMapping.find(mapping => mapping[0] === key)[1]
    } ${options[key]}`);
  }, "");

  additionalParameters &&
    (optionsString = Object.keys(additionalParameters).reduce(
      (accumulator, key) => {
        return (accumulator += ` ${key} ${additionalParameters[key]}`);
      },
      optionsString
    ));

  return optionsString.trim();
}

export const checkRequired = value => {
  return value !== ""
    ? null
    : {
        error: true,
        helperText: "This field is required."
      };
};

export const checkMin = (value, min) => {
  return value >= min
    ? null
    : {
        error: true,
        helperText: `The value must be ${min} or greater.`
      };
};

export const checkMax = (value, max) => {
  return value <= max
    ? null
    : {
        error: true,
        helperText: `The value must be ${max} or smaller.`
      };
};

export const checkBetween = (value, min, max) => {
  return min < value && value < max
    ? null
    : {
        error: true,
        helperText: `The value must be between ${min} and ${max}.`
      };
};

export const checkDuplicate = (value, array) => {
  return array.includes(value)
    ? {
        error: true,
        helperText: `"${value}" already exists.`
      }
    : null;
};

export const MosesOptionsMapping = [
  ["maximumEvals", "-m"],
  ["resultCount", "--result-count"],
  ["featureSelectionTargetSize", "--fs-target-size"],
  ["numberOfThreads", "-j"],
  ["reductKnobBuildingEffort", "--reduct-knob-building-effort"],
  ["featureSelectionAlgorithm", "--fs-algo"],
  ["complexityRatio", "--complexity-ratio"],
  ["enableFeatureSelection", "--enable-fs"],
  ["hcWidenSearch", "--hc-widen-search"],
  ["balance", "--balance"],
  ["hcCrossoverMinNeighbors", "hc-crossover-min-neighbors"],
  ["hcCrossoverPopSize", "hc-crossover-pop-size"]
];
