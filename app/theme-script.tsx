export function ThemeScript() {
  const themeScript = `
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}