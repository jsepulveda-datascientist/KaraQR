import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactionsDisplayComponent } from './reactions-display.component';
import { ReactionsService } from '../../../core/services/reactions.service';
import { BehaviorSubject } from 'rxjs';

describe('ReactionsDisplayComponent', () => {
  let component: ReactionsDisplayComponent;
  let fixture: ComponentFixture<ReactionsDisplayComponent>;
  let mockReactionsService: jasmine.SpyObj<ReactionsService>;

  beforeEach(async () => {
    // Mock del ReactionsService
    mockReactionsService = jasmine.createSpyObj('ReactionsService', [
      'connect',
      'disconnect',
      'clearFeed',
      'resetStats',
      'getChannelInfo',
      'isChannelConnected'
    ]);

    // Mock de los observables
    mockReactionsService.stats$ = new BehaviorSubject({
      love: 0,
      fire: 0,
      clap: 0,
      music: 0,
      amazing: 0,
      totalComments: 0
    });
    
    mockReactionsService.feed$ = new BehaviorSubject([]);
    mockReactionsService.connection$ = new BehaviorSubject(false);

    await TestBed.configureTestingModule({
      imports: [ReactionsDisplayComponent],
      providers: [
        { provide: ReactionsService, useValue: mockReactionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReactionsDisplayComponent);
    component = fixture.componentInstance;
    component.tenantId = 'test-tenant';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect to reactions on init when autoConnect is true', async () => {
    component.autoConnect = true;
    component.tenantId = 'test-tenant';
    
    mockReactionsService.connect.and.returnValue(Promise.resolve({ success: true }));
    
    await component.ngOnInit();
    
    expect(mockReactionsService.connect).toHaveBeenCalledWith('test-tenant');
  });

  it('should not connect when tenantId is empty', async () => {
    component.autoConnect = true;
    component.tenantId = '';
    
    await component.connectToReactions();
    
    expect(mockReactionsService.connect).not.toHaveBeenCalled();
  });

  it('should clear feed when clearFeed is called', () => {
    component.clearFeed();
    
    expect(mockReactionsService.clearFeed).toHaveBeenCalled();
  });

  it('should format timestamp correctly', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    expect(component.formatTimestamp(now)).toBe('ahora');
    expect(component.formatTimestamp(oneMinuteAgo)).toBe('hace 1m');
    expect(component.formatTimestamp(oneHourAgo)).toBe('hace 1h');
  });
});