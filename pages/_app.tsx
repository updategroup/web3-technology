import "../styles/globals.css";
import '../public/antd.min.css';
import { MeshProvider } from "@meshsdk/react";
import { AppPropsWithLayout } from "@/models";
import { EmptyLayout } from "components/layout";
import withTheme from '../theme';
import { PolybaseProvider } from "@polybase/react";
import { Polybase } from "@polybase/client";

const polybase = new Polybase({ defaultNamespace: "demo" });

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const Layout = Component.Layout ?? EmptyLayout;

  return withTheme(
    <>
      <MeshProvider>
        <PolybaseProvider polybase={polybase}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PolybaseProvider>
      </MeshProvider>
    </>
  );
}