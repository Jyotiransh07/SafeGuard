import { GalleryHeading } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame">
      <GalleryHeading
        variant="horizontal-sweep"
        mode="light"
        font="oldstyle"
        weight="700"
        headlineSize={1.40}
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}

export default Scene;
