export const $ = id => document.getElementById(id);

const checks = {
  portal: ['spatial', 'portal'],
  depth: ['inset-front', '100px'],
  stage: ['portal-stage', '260px 520px / 1000px 0px'],
  anchors: ['inset-front', 'anchor(front, 0px)'],
  area: ['position-area', 'top center / front'],
  context: ['position-context', 'anchor'],
  origin: ['place-self', 'anchor-origin / anchor-origin'],
  size: ['width', 'anchor-size(depth, 40px)'],
  alignment: ['z-align-self', 'end'],
};
const features = Object.fromEntries(Object.entries(checks).map(([key, [property, value]]) =>
  [key, CSS.supports(property, value)]));
features.models = 'ready' in document.createElement('model');
features.orbit = features.models && 'stageMode' in document.createElement('model');
document.documentElement.classList.toggle('no-spatial', !features.portal);

const models = [...document.querySelectorAll('model')];
const required = (document.body.dataset.needs || 'portal').split(/\s+/);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionListeners = new Set();
let paused = reducedMotion.matches;
const records = Object.fromEntries(models.map(model => [model.id, {
  name: model.dataset.name || model.id,
  source: model.getAttribute('src'),
  state: 'loading',
}]));
window.demoState = {features, assets: records, errors: [], motionPaused: paused};
window.demoApi = {};

function renderStatus() {
  const status = document.querySelector('[data-runtime]');
  if (!status) { return; }
  const missing = required.filter(key => !features[key]);
  if (missing.length) {
    status.dataset.state = 'unsupported';
    status.textContent = missing.includes('models') && !isSecureContext ?
      'Open this suite over localhost to use native model elements.' :
      `This test needs the experimental browser features: ${missing.join(', ')}.`;
    return;
  }
  const entries = Object.values(records);
  const failed = entries.filter(record => record.state === 'error');
  if (failed.length) {
    status.dataset.state = 'error';
    status.textContent = `Could not load: ${failed.map(record => record.name).join(', ')}. See the model fallback text.`;
    return;
  }
  const loaded = entries.filter(record => record.state === 'ready').length;
  status.dataset.state = loaded === entries.length ? 'ready' : 'loading';
  status.textContent = entries.length ?
    `Spatial CSS enabled · ${loaded}/${entries.length} USDZ models loaded` :
    document.querySelector('.portal') ? 'Spatial CSS enabled · native HTML in the back context' :
    'Spatial CSS enabled · native model support available';
}

function reportError(error, model) {
  const message = error?.message || String(error || 'Model loading failed');
  window.demoState.errors.push({model: model?.id || null, message});
  if (model) {
    records[model.id].state = 'error';
    records[model.id].error = message;
    const fallback = model.querySelector('.fallback');
    if (fallback) { fallback.textContent = `${records[model.id].name} could not be loaded.`; }
  }
  renderStatus();
}

export function onMotionChange(callback) {
  motionListeners.add(callback);
  callback(paused);
  return () => motionListeners.delete(callback);
}

export function setPaused(value) {
  paused = Boolean(value);
  window.demoState.motionPaused = paused;
  document.body.classList.toggle('motion-paused', paused);
  for (const button of document.querySelectorAll('[data-motion]')) {
    button.textContent = paused ? 'Resume motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(paused));
  }
  for (const model of models) {
    if (records[model.id].state === 'ready' && model.duration > 0 && model.hasAttribute('autoplay')) {
      (paused ? model.pause() : model.play()).catch(error => reportError(error));
    }
  }
  for (const callback of motionListeners) { callback(paused); }
}

export function isPaused() { return paused; }

export function watchRange(id, callback, suffix = '') {
  const control = $(id);
  const output = document.querySelector(`output[for="${id}"]`);
  function update() {
    const value = Number(control.value);
    if (output) { output.value = `${value}${suffix}`; }
    callback(value);
  }
  control.addEventListener('input', update);
  update();
  return update;
}

for (const button of document.querySelectorAll('[data-motion]')) {
  button.addEventListener('click', () => setPaused(!paused));
}
reducedMotion.addEventListener('change', event => setPaused(event.matches));

for (const source of document.querySelectorAll('[data-css-source]')) {
  const style = document.querySelector('style[data-test-css]');
  source.textContent = style?.textContent.trim() || '';
}

window.addEventListener('error', event => {
  if (event.message) { reportError(new Error(event.message)); }
});
window.addEventListener('unhandledrejection', event => reportError(event.reason));

export const modelsReady = Promise.all(models.map(async model => {
  if (!('ready' in model)) {
    records[model.id].state = 'unsupported';
    return null;
  }
  model.addEventListener('error', () => reportError(new Error('Native model load error'), model));
  if (paused) { model.autoplay = false; }
  try {
    await model.ready;
    const center = model.boundingBoxCenter, extents = model.boundingBoxExtents;
    records[model.id].state = 'ready';
    records[model.id].duration = model.duration;
    records[model.id].bounds = {
      center: {x: center.x, y: center.y, z: center.z},
      extents: {x: extents.x, y: extents.y, z: extents.z},
    };
    // Keep the authored autoplay intent available after a reduced-motion load.
    if (model.dataset.autoplay === 'true') { model.autoplay = true; }
    if (model.duration > 0 && model.hasAttribute('autoplay')) {
      await (paused ? model.pause() : model.play());
    }
  } catch (error) {
    reportError(error, model);
  }
  renderStatus();
  return model;
}));
window.demoReady = modelsReady;
window.demoApi.setPaused = setPaused;
setPaused(paused);
renderStatus();
