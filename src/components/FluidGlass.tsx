import { memo } from 'react';
import GlassSurface, { type GlassSurfaceProps } from './GlassSurface';

type FluidGlassProps = GlassSurfaceProps;

const FluidGlass = memo((props: FluidGlassProps) => (
  <GlassSurface {...props} />
));

FluidGlass.displayName = 'FluidGlass';

export default FluidGlass;
