import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChangelogPage } from "./pages/ChangelogPage";
import { DocPage } from "./pages/DocPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { VersionMatrixPage } from "./pages/VersionMatrixPage";

export function App(): JSX.Element {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/docs/:slug" element={<DocPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/versions" element={<VersionMatrixPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
