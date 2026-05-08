const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    interval: "month",
    applicationLimit: 1,
  },
  bronze: {
    name: "Bronze",
    price: 100,
    interval: "month",
    applicationLimit: 3,
  },
  silver: {
    name: "Silver",
    price: 300,
    interval: "month",
    applicationLimit: 5,
  },
  gold: {
    name: "Gold",
    price: 1000,
    interval: "month",
    applicationLimit: null,
  },
};

function getPlan(planId = "free") {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}

function getApplicationLimit(planId = "free") {
  return getPlan(planId).applicationLimit;
}

module.exports = {
  SUBSCRIPTION_PLANS,
  getPlan,
  getApplicationLimit,
};
