import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { BatteriesMasterComponent } from '../batteries/master/master.component';
import { BatteriesDetailComponent } from '../batteries/detail/detail.component';
import { IncidentsMasterComponent } from '../incidents/master/master.component';
import { IncidentsDetailComponent } from '../incidents/detail/detail.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'batteries', component: BatteriesMasterComponent },
      { path: 'batteries/create', component: BatteriesDetailComponent },
      { path: 'batteries/edit/:id', component: BatteriesDetailComponent },

      { path: 'incidents', component: IncidentsMasterComponent },
      { path: 'incidents/create', component: IncidentsDetailComponent },
      { path: 'incidents/edit/:id', component: IncidentsDetailComponent },
     
      {
        path: '',
        redirectTo: '/tabs/batteries',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/batteries',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
