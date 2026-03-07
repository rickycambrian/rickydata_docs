import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChangelogPage } from "./pages/ChangelogPage";
import { DocPage } from "./pages/DocPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaybooksPage } from "./pages/PlaybooksPage";
import { ProductPage } from "./pages/ProductPage";
import { QuickstartPage } from "./pages/QuickstartPage";
import { SearchPage } from "./pages/SearchPage";
import { VersionMatrixPage } from "./pages/VersionMatrixPage";

export function App(): JSX.Element {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quickstart" element={<QuickstartPage />} />
        <Route path="/playbooks" element={<PlaybooksPage />} />
        <Route path="/products/:product" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/docs/:slug" element={<DocPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/versions" element={<VersionMatrixPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
