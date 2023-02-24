import svgPanZoom from "svg-pan-zoom";
import { onMounted, reactive, ref } from "vue";

export function useZoom(el, opts = {}) {
  const transform = reactive({
    k: 1,
    x: 0,
    y: 0,
  });
  const zoom = ref(null);
  const initZoom = () => {
    zoom.value = svgPanZoom(el.value, {
      onUpdatedCTM: (e) => {
        transform.k = e.a;
        transform.x = e.e;
        transform.y = e.f;
      },
      ...opts,
    });
  };
  onMounted(initZoom);
  return { transform, zoom };
}

export function offset2svg(offsetX, offsetY, transform) {
  const svg_x = (offsetX - transform.x) / transform.k;
  const svg_y = (offsetY - transform.y) / transform.k;
  return {
    x: svg_x,
    y: svg_y,
  };
}

export function svg2offset(svgX, svgY, transform) {
  const offset_x = svgX * transform.k + transform.x;
  const offset_y = svgY * transform.k + transform.y;
  return {
    x: offset_x,
    y: offset_y,
  };
}
