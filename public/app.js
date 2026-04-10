const modeSelect = document.getElementById("modeSelect");
const vehicleIdInput = document.getElementById("vehicleId");
const loadSummaryBtn = document.getElementById("loadSummaryBtn");

const displayNameEl = document.getElementById("displayName");
const batteryLevelEl = document.getElementById("batteryLevel");
const vehicleStateEl = document.getElementById("vehicleState");
const batteryRangeEl = document.getElementById("batteryRange");
const lockStatusEl = document.getElementById("lockStatus");
const outputEl = document.getElementById("output");

const lockBtn = document.getElementById("lockBtn");
const unlockBtn = document.getElementById("unlockBtn");
const toggleLockBtn = document.getElementById("toggleLockBtn");
const drainBtn = document.getElementById("drainBtn");
const chargeBtn = document.getElementById("chargeBtn");

function getVehicleId() {
  return vehicleIdInput.value.trim();
}

function getMode() {
  return modeSelect.value;
}

function setOutput(data) {
  outputEl.textContent = JSON.stringify(data, null, 2);
}

function renderSummary(summary) {
  const data = summary.data || summary;

  displayNameEl.textContent = data.display_name ?? "-";
  batteryLevelEl.textContent =
    data.battery_level !== undefined ? `${data.battery_level}%` : "-";
  vehicleStateEl.textContent = data.state ?? "-";
  batteryRangeEl.textContent =
    data.battery_range !== undefined ? `${data.battery_range} mi` : "-";
  lockStatusEl.textContent =
    data.locked !== undefined ? (data.locked ? "Yes" : "No") : "-";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function getSummaryUrl(id) {
  const mode = getMode();
  return mode === "sim"
    ? `/sim/vehicles/${id}/summary`
    : `/tesla/vehicles/${id}/summary`;
}

function getCommandUrl(id, command) {
  const mode = getMode();

  if (mode === "sim") {
    return `/sim/vehicles/${id}/${command}`;
  }

  return `/tesla/vehicles/${id}/${command}`;
}

async function loadSummary() {
  const id = getVehicleId();

  try {
    const data = await fetchJson(getSummaryUrl(id));
    renderSummary(data);
    setOutput(data);
  } catch (error) {
    setOutput({ error: error.message });
  }
}

async function runCommand(command) {
  const id = getVehicleId();

  try {
    const data = await fetchJson(getCommandUrl(id, command), {
      method: "POST"
    });

    setOutput(data);
    await loadSummary();
  } catch (error) {
    setOutput({ error: error.message });
  }
}

function updateButtonVisibility() {
  const mode = getMode();

  toggleLockBtn.style.display = mode === "sim" ? "inline-block" : "none";
  drainBtn.style.display = mode === "sim" ? "inline-block" : "none";
  chargeBtn.style.display = mode === "sim" ? "inline-block" : "none";
}

loadSummaryBtn.addEventListener("click", loadSummary);
modeSelect.addEventListener("change", () => {
  updateButtonVisibility();
  loadSummary();
});

lockBtn.addEventListener("click", () => runCommand("lock"));
unlockBtn.addEventListener("click", () => runCommand("unlock"));
toggleLockBtn.addEventListener("click", () => runCommand("toggle-lock"));
drainBtn.addEventListener("click", () => runCommand("drain"));
chargeBtn.addEventListener("click", () => runCommand("charge"));

updateButtonVisibility();
loadSummary();