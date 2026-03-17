import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementCreateComponent } from './movement-create.component';

describe('MovementCreateComponent', () => {
  let component: MovementCreateComponent;
  let fixture: ComponentFixture<MovementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
