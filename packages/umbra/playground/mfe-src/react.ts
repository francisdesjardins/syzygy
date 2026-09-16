// React itself. The host serves it so every React fragment gets *the* React the binding was built
// against; two copies would be two hook dispatchers.
export { createElement, useEffect, useMemo, useState } from 'react';
