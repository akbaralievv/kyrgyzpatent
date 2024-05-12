import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { AuthPage } from "./pages/public/AuthPage";
import { HomePage } from './pages/public/HomePage';
import { ReferencePage } from './pages/admin/ReferencePage';
import { UserPage } from './pages/admin/UserPage';
import { KnowledgeAdminPage } from './pages/admin/KnowledgeAdminPage';
import { DetailPage } from './pages/public/DetailPage';
import { KnowledgePage } from './pages/public/KnowledgePage'

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Switch>

                <Route path="/detail/:id" exact>
                    <DetailPage />
                </Route>
                <Route path="/knowledges" exact>
                    <KnowledgePage />
                </Route>
                <Route path="/" exact>
                    <HomePage />
                </Route>
                <Route path="/users" exact>
                    <UserPage />
                </Route>
                <Route path="/references" exact>
                    <ReferencePage />
                </Route>
                <Route path="/admin_knowledges" exact>
                    <KnowledgeAdminPage />
                </Route>
                <Redirect to="/" />

            </Switch>
        )
    }

    return (
        <Switch>
            <Route path="/detail/:id" exact>
                <DetailPage />
            </Route>
            <Route path="/knowledges" exact>
                <KnowledgePage />
            </Route>
            <Route path="/login" exact>
                <AuthPage />
            </Route>
            <Route path="/" exact>
                <HomePage />
            </Route>
            <Redirect to="/" />
        </Switch>
    )

};