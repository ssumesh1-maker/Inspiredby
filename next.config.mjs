const pagesBuild = process.env.PAGES_PREVIEW === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/Inspiredby';

export default pagesBuild
  ? {
      output: 'export',
      basePath,
      env: { NEXT_PUBLIC_BASE_PATH: basePath },
      trailingSlash: true
    }
  : {};
