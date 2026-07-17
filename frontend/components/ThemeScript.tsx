// Runs before paint to avoid a flash of the wrong theme.
const THEME_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('portalflow_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
