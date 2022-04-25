import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="content" id="main-content">
          <div className="content__container">
            <Routes>
              <Route path={'/otr/etusivu'} element={<h1>Hello OTR World</h1>} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};
