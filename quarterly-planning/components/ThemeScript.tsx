/**
 * Inlined script that runs before paint to apply the persisted theme,
 * preventing a flash of the wrong palette on first load.
 */
export function ThemeScript() {
  const code = `(function() {
    try {
      var stored = localStorage.getItem('qp_theme_v2');
      if (stored === 'dark' || stored === 'light') {
        document.documentElement.setAttribute('data-theme', stored);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
