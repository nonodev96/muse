import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsDetailComponent } from './playlists-detail.component';

describe('PlaylistsDetailComponent', () => {
  let component: PlaylistsDetailComponent;
  let fixture: ComponentFixture<PlaylistsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
