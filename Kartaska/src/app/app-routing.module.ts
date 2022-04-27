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
  },
  {
    path: 'lobby',
    loadChildren: () => import('./pages/lobby/lobby.module').then( m => m.LobbyPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
