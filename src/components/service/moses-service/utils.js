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

export const checkMosesOptionValidity = value => {
  return value === "" || MosesOptions.find(o => o.option.includes(value))
    ? null
    : {
        error: true,
        helperText: `"${value}" is not a valid moses option.`
      };
};

export const checkMosesOptionValueValidity = (option, value) => {
  const type = isNaN(value)
    ? "string"
    : value.includes(".")
    ? "float"
    : "integer";
  const mosesOption = MosesOptions.find(o => o.option.includes(option));
  return !mosesOption ||
    (mosesOption.type === "float" && type === "string") ||
    (mosesOption.type === "integer" && type !== "integer")
    ? {
        error: true,
        helperText: `"${option}" accepts ${mosesOption.type} value.`
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

export const MosesOptions = [
  {
    option: ["-K", "--ip_kld_weight"],
    type: "integer"
  },
  {
    option: ["-J", "--ip_skewness_weight"],
    type: "integer"
  },
  {
    option: ["-U", "--ip_stdU_weight"],
    type: "integer"
  },
  {
    option: ["-X", "--ip_skew_U_weight"],
    type: "integer"
  },
  {
    option: ["-i", "---input-file"],
    type: "string"
  },
  {
    option: ["-u", "--target-feature"],
    type: "string"
  },
  {
    option: ["--score-weight"],
    type: "string"
  },
  {
    option: ["--timestamp-feature"],
    type: "string"
  },
  {
    option: ["-Y", "--igonre-feature"],
    type: "string"
  },
  {
    option: ["-y", "--combo-program"],
    type: "string"
  },
  {
    option: ["-k", "--problem-size"],
    type: "integer"
  },
  {
    option: ["-j", "--jobs"],
    type: "integer"
  },
  {
    option: ["--mini-pool"],
    type: "integer"
  },
  {
    option: ["-e", "--exemplar"],
    type: "string"
  },
  {
    option: ["-H", "--problem"],
    type: "string"
  },
  {
    option: ["-b", "--nsamples"],
    type: "integer"
  },
  {
    option: ["--balance"],
    type: "integer"
  },
  {
    option: ["-a", "--opt-algo"],
    type: "string"
  },
  {
    option: ["-A", "--max-score"],
    type: "float"
  },
  {
    option: ["-m", "--max-evals"],
    type: "integer"
  },
  {
    option: ["--max-time"],
    type: "integer"
  },
  {
    option: ["-s", "--cache-size"],
    type: "integer"
  },
  {
    option: ["-n", "--ignore-operator"],
    type: "string"
  },
  {
    option: ["--linear-regression"],
    type: "integer"
  },
  {
    option: ["--logical-perm-ratio"],
    type: "integer"
  },
  {
    option: ["-r", "--random-seed"],
    type: "integer"
  },
  {
    option: ["-v", "--complexity-temprature"],
    type: "integer"
  },
  {
    option: ["-z", "--complexity-ratio"],
    type: "float"
  },
  {
    option: ["--cap-coef"],
    type: "integer"
  },
  {
    option: ["--hc-max-nn-evals"],
    type: "integer"
  },
  {
    option: ["--hc-fraction-of-nn"],
    type: "integer"
  },
  {
    option: ["-Z", "--hc-crossover"],
    type: "integer"
  },
  {
    option: ["--hc-crossover-pop-size"],
    type: "integer"
  },
  {
    option: ["--hc-crossover-min-neighbors"],
    type: "integer"
  },
  {
    option: ["--hc-resize-to-fit-ram"],
    type: "integer"
  },
  {
    option: ["--hc-allow-resize-deme"],
    type: "integer"
  },
  {
    option: ["--ps-max-particles"],
    type: "integer"
  },
  {
    option: ["--contin-depth"],
    type: "integer"
  },
  {
    option: ["--boost"],
    type: "integer"
  },
  {
    option: ["--boost-promote"],
    type: "integer"
  },
  {
    option: ["--boost-exact"],
    type: "integer"
  },
  {
    option: ["--boost-expalpha"],
    type: "integer"
  },
  {
    option: ["--boost-bias"],
    type: "integer"
  },
  {
    option: ["-B", "--reduce-knob-building-effort"],
    type: "integer"
  },
  {
    option: ["-D", "--max-dist"],
    type: "integer"
  },
  {
    option: ["-d", "--reduce-all"],
    type: "integer"
  },
  {
    option: ["-E", "--reduce-candidate-effort"],
    type: "integer"
  },
  {
    option: ["-g", "--max-gens"],
    type: "integer"
  },
  {
    option: ["--discard-dominated"],
    type: "integer"
  },
  {
    option: ["-L", "--hc-single-step"],
    type: "integer"
  },
  {
    option: ["-N", "--include-only-operator"],
    type: "string"
  },
  {
    option: ["-P", "--pop-size-ratio"],
    type: "integer"
  },
  {
    option: ["-p", "--noise"],
    type: "integer"
  },
  {
    option: ["-T", "--hc-widen-search"],
    type: "integer"
  },
  {
    option: ["--well-enough"],
    type: "integer"
  },
  {
    option: ["--revisit"],
    type: "integer"
  },
  {
    option: ["-c", "--result-count"],
    type: "integer"
  },
  {
    option: ["-S", "--output-score"],
    type: "integer"
  },
  {
    option: ["-x", "--output-cscore"],
    type: "integer"
  },
  {
    option: ["-t", "--output-bscore"],
    type: "integer"
  },
  {
    option: ["-C", "--output-only-best"],
    type: "integer"
  },
  {
    option: ["-V", "--output-eval-number"],
    type: "integer"
  },
  {
    option: ["-W", "--output-with-labels"],
    type: "integer"
  },
  {
    option: ["--output-deme-id"],
    type: "integer"
  },
  {
    option: ["--output-format"],
    type: "string"
  },
  {
    option: ["-o", "--output-file"],
    type: "string"
  },
  {
    option: ["-q", "--min-rand-input"],
    type: "integer"
  },
  {
    option: ["-w", "--max-rand-input"],
    type: "integer"
  },
  {
    option: ["-l", "--log-level"],
    type: "string"
  },
  {
    option: ["-F", "--log-file-dep-opt"],
    type: "string"
  },
  {
    option: ["-f", "--log-file"],
    type: "string"
  },
  {
    option: ["-M", "--max-candidates-per-deme"],
    type: "integer"
  },
  {
    option: ["-G", "--weighted-accuracy"],
    type: "integer"
  },
  {
    option: ["--diversity-pressure"],
    type: "integer"
  },
  {
    option: ["--diversity-exponent"],
    type: "integer"
  },
  {
    option: ["--diversity-normalize"],
    type: "integer"
  },
  {
    option: ["--diversity-dst"],
    type: "string"
  },
  {
    option: ["--diversity-p-norm"],
    type: "integer"
  },
  {
    option: ["--diversity-dst2dp"],
    type: "string"
  },
  {
    option: ["-R", "--discretize-threshold"],
    type: "string"
  },
  {
    option: ["-Q", "--alpha"],
    type: "integer"
  },
  {
    option: ["--time-dispersion-pressure"],
    type: "integer"
  },
  {
    option: ["--time-dispersion-exponent"],
    type: "integer"
  },
  {
    option: ["--time-bscore"],
    type: "integer"
  },
  {
    option: ["--time-bscore-granuality"],
    type: "string"
  },
  {
    option: ["--gen-best-tree"],
    type: "integer"
  },
  {
    option: ["--it-abs-err"],
    type: "integer"
  },
  {
    option: ["--pre-positive"],
    type: "integer"
  },
  {
    option: ["--enable-fs"],
    type: "integer"
  },
  {
    option: ["--fs-target-size"],
    type: "integer"
  },
  {
    option: ["--fs-exp-distrib"],
    type: "integer"
  },
  {
    option: ["--fs-focus"],
    type: "string"
  },
  {
    option: ["--fs-seed"],
    type: "string"
  },
  {
    option: ["--fs-prune-exemplar"],
    type: "integer"
  },
  {
    option: ["--fs-subsampling-ratio"],
    type: "integer"
  },
  {
    option: ["--fs-subsampling-by-time"],
    type: "integer"
  },
  {
    option: ["--fs-demes"],
    type: "integer"
  },
  {
    option: ["--fs-algo"],
    type: "string"
  },
  {
    option: ["--fs-scorer"],
    type: "string"
  },
  {
    option: ["--fs-threshold"],
    type: "integer"
  },
  {
    option: ["--fs-enforce-features-filename"],
    type: "string"
  },
  {
    option: ["--fs-diversity-pressure"],
    type: "integer"
  },
  {
    option: ["--fs-diversity-cap"],
    type: "integer"
  },
  {
    option: ["--fs-diversity-interaction"],
    type: "integer"
  },
  {
    option: ["--fs-diversity-jaccard"],
    type: "integer"
  },
  {
    option: ["--fs-inc-redundant-intensity"],
    type: "integer"
  },
  {
    option: ["--fs-inc-target-size-epsilon"],
    type: "float"
  },
  {
    option: ["--fs-inc-interaction-terms"],
    type: "integer"
  },
  {
    option: ["--fs-pre-penalty"],
    type: "integer"
  },
  {
    option: ["--fs-pre-min-activation"],
    type: "float"
  },
  {
    option: ["--fs-pre-max-activation"],
    type: "integer"
  },
  {
    option: ["--fs-pre-positive"],
    type: "integer"
  },
  {
    option: ["--fs-hc-max-score"],
    type: "integer"
  },
  {
    option: ["--fs-hc-max-evals"],
    type: "integer"
  },
  {
    option: ["--fs-hc-fraction-of-remaining"],
    type: "float"
  },
  {
    option: ["--fs-hc-crossover"],
    type: "integer"
  },
  {
    option: ["--fs-hc-crossover-pop-size"],
    type: "integer"
  },
  {
    option: ["--fs-hc-crossover-min-neighbors"],
    type: "integer"
  },
  {
    option: ["--fs-hc-widen-search"],
    type: "integer"
  },
  {
    option: ["--fs-mi-penalty"],
    type: "integer"
  },
  {
    option: ["--fs-smd-top-size"],
    type: "integer"
  },
  {
    option: ["--ss-n-subsample-demes"],
    type: "integer"
  },
  {
    option: ["--ss-n-top-candidates"],
    type: "integer"
  },
  {
    option: ["--ss-n-tuples"],
    type: "integer"
  },
  {
    option: ["--ss-std-dev-threshold"],
    type: "float"
  },
  {
    option: ["--ss-tanimoto-mean-threshold"],
    type: "integer"
  },
  {
    option: ["--ss-tanimoto-geometric-mean-threshold"],
    type: "integer"
  },
  {
    option: ["--ss-tanimoto-max-threshold"],
    type: "integer"
  },
  {
    option: ["--ss-n-best-bfdemes"],
    type: "integer"
  },
  {
    option: ["--ss-tanimoto-mean-weight"],
    type: "integer"
  },
  {
    option: ["--ss-tanimoto-geometric-mean-weight"],
    type: "integer"
  },
  {
    option: ["--ss-tanimoto-max-weight"],
    type: "integer"
  },
  {
    option: ["--ss-n-subsample-fitness"],
    type: "integer"
  },
  {
    option: ["--ss-low-dev-pressure"],
    type: "integer"
  },

  {
    option: ["--ss-by-time"],
    type: "integer"
  },
  {
    option: ["--ss-contiguos-time"],
    type: "integer"
  }
];
