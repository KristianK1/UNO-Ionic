import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'mainApp',
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./pages/home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'lobby',
        loadChildren: () => import('./pages/lobby/lobby.module').then(m => m.LobbyPageModule)
      },
      {
        path: 'account-settings',
        loadChildren: () => import('./pages/account-settings/account-settings.module').then(m => m.AccountSettingsPageModule)
      },
      {
        path: 'open-lobby',
        loadChildren: () => import('./pages/open-lobby/open-lobby.module').then(m => m.OpenLobbyPageModule)
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'log-reg',
    loadChildren: () =>
      import('./pages/log-reg/log-reg.module').then((m) => m.LogRegPageModule),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/log-reg/log-reg.module').then((m) => m.LogRegPageModule),
  },  {
    path: 'color-chooser',
    loadChildren: () => import('./pages/smallPages/color-chooser/color-chooser.module').then( m => m.ColorChooserPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
