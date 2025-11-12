import StyledJsxRegistry from './lib/registry';

export const metadata = {
  title: 'Khaled Aun',
  description: 'Khaled Aun personal site',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
      </body>
    </html>
  );
}


