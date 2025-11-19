import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { SingerLayoutComponent } from '../shared';

interface Reaction {
  id: string;
  emoji: string;
  name: string;
  count: number;
  isActive: boolean;
  description: string;
}

interface ReactionStats {
  totalReactions: number;
  topReaction: string;
  recentReactions: Reaction[];
}

@Component({
  selector: 'app-singer-reactions',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    SingerLayoutComponent
  ],
  template: `
    <app-singer-layout>
      <!-- Estado de reacciones -->
      <div class="field">
        <label class="block font-medium mb-2">
          📊 Mi Actividad
        </label>
        <div class="reactions-status">
          <div class="status-stats">
            <div class="stat-item">
              <span class="stat-number">{{ reactionStats.totalReactions }}</span>
              <span class="stat-label">Reacciones Hoy</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-emoji">{{ reactionStats.topReaction }}</span>
              <span class="stat-label">Más Popular</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reacciones rápidas -->
      <div class="field">
        <label class="block font-medium mb-2">
          🚀 Reacciones Rápidas
        </label>
        <div class="reactions-grid">
          <button 
            *ngFor="let reaction of quickReactions"
            pButton 
            [class]="'reaction-btn ' + (reaction.isActive ? 'p-button-success' : 'p-button-outlined')"
            (click)="toggleReaction(reaction)">
            <div class="reaction-content">
              <span class="reaction-emoji">{{ reaction.emoji }}</span>
              <span class="reaction-name">{{ reaction.name }}</span>
              <p-badge 
                [value]="reaction.count.toString()" 
                *ngIf="reaction.count > 0"
                [severity]="reaction.isActive ? 'success' : 'secondary'">
              </p-badge>
            </div>
          </button>
        </div>
      </div>

      <!-- Reacciones para cantantes -->
      <div class="field">
        <label class="block font-medium mb-2">
          🎤 Para Cantantes
        </label>
        <div class="singer-reactions-grid">
          <button 
            *ngFor="let reaction of singerReactions"
            pButton 
            [class]="'singer-reaction-btn ' + (reaction.isActive ? 'p-button-info' : 'p-button-outlined')"
            (click)="toggleReaction(reaction)">
            <div class="reaction-content">
              <span class="reaction-emoji">{{ reaction.emoji }}</span>
              <span class="reaction-name">{{ reaction.name }}</span>
              <span class="reaction-description">{{ reaction.description }}</span>
              <p-badge 
                [value]="reaction.count.toString()" 
                *ngIf="reaction.count > 0"
                [severity]="reaction.isActive ? 'info' : 'secondary'">
              </p-badge>
            </div>
          </button>
        </div>
      </div>

      <!-- Reacciones recientes -->
      <div class="field">
        <label class="block font-medium mb-2">
          ⏰ Actividad Reciente
        </label>
        <div class="recent-reactions">
          <div 
            *ngFor="let reaction of reactionStats.recentReactions" 
            class="recent-item">
            <span class="recent-emoji">{{ reaction.emoji }}</span>
            <span class="recent-name">{{ reaction.name }}</span>
            <span class="recent-time">Hace 2 min</span>
          </div>
          
          <div class="no-reactions" *ngIf="reactionStats.recentReactions.length === 0">
            <i class="pi pi-heart"></i>
            <p>¡Sé el primero en reaccionar!</p>
          </div>
        </div>
      </div>

      <!-- Consejos de uso -->
      <div class="field">
        <label class="block font-medium mb-2">
          💡 Consejos
        </label>
        <div class="usage-tips">
          <div class="tip-item">
            <i class="pi pi-info-circle"></i>
            <span>Usa reacciones para mostrar apoyo a otros cantantes</span>
          </div>
          <div class="tip-item">
            <i class="pi pi-heart"></i>
            <span>Las reacciones aparecen en pantalla en tiempo real</span>
          </div>
          <div class="tip-item">
            <i class="pi pi-users"></i>
            <span>Crea un ambiente positivo y divertido</span>
          </div>
        </div>
      </div>
    </app-singer-layout>
  `,
  styleUrl: './singer-reactions.component.scss'
})
export class SingerReactionsComponent implements OnInit {

  reactionStats: ReactionStats = {
    totalReactions: 23,
    topReaction: '👏',
    recentReactions: []
  };

  quickReactions: Reaction[] = [
    { id: '1', emoji: '👏', name: 'Aplauso', count: 5, isActive: false, description: 'Aplaude la presentación' },
    { id: '2', emoji: '❤️', name: 'Me gusta', count: 3, isActive: true, description: 'Te gusta la canción' },
    { id: '3', emoji: '🔥', name: 'Genial', count: 8, isActive: false, description: 'Presentación increíble' },
    { id: '4', emoji: '😍', name: 'Wow', count: 2, isActive: false, description: 'Estás impresionado' },
    { id: '5', emoji: '🎉', name: 'Fiesta', count: 6, isActive: false, description: 'Ambiente festivo' },
    { id: '6', emoji: '⭐', name: 'Estrella', count: 4, isActive: false, description: 'Canto de estrella' }
  ];

  singerReactions: Reaction[] = [
    { id: '7', emoji: '🎤', name: 'Próximo', count: 1, isActive: false, description: 'Quiero cantar después' },
    { id: '8', emoji: '🙋‍♂️', name: 'Dueto', count: 0, isActive: false, description: 'Proponer un dueto' },
    { id: '9', emoji: '🎵', name: 'Pedido', count: 2, isActive: false, description: 'Pedir una canción' },
    { id: '10', emoji: '👥', name: 'Grupal', count: 0, isActive: false, description: 'Canción grupal' }
  ];

  ngOnInit(): void {
    this.loadRecentReactions();
  }

  toggleReaction(reaction: Reaction): void {
    // Toggle the reaction state
    reaction.isActive = !reaction.isActive;
    
    // Update count
    if (reaction.isActive) {
      reaction.count++;
      this.reactionStats.totalReactions++;
    } else {
      reaction.count = Math.max(0, reaction.count - 1);
      this.reactionStats.totalReactions = Math.max(0, this.reactionStats.totalReactions - 1);
    }

    // Update recent reactions
    if (reaction.isActive) {
      this.addToRecentReactions(reaction);
    }

    // Update top reaction
    this.updateTopReaction();

    // TODO: Aquí se enviaría la reacción al servidor en tiempo real
    console.log('Reaction toggled:', reaction);
  }

  private loadRecentReactions(): void {
    // Simular reacciones recientes
    this.reactionStats.recentReactions = [
      { id: '11', emoji: '👏', name: 'Juan aplaudió', count: 1, isActive: false, description: '' },
      { id: '12', emoji: '❤️', name: 'María le gustó', count: 1, isActive: false, description: '' },
      { id: '13', emoji: '🔥', name: 'Carlos dice genial', count: 1, isActive: false, description: '' }
    ];
  }

  private addToRecentReactions(reaction: Reaction): void {
    const recentReaction: Reaction = {
      ...reaction,
      name: `Tú ${reaction.name.toLowerCase()}`,
      isActive: false
    };

    this.reactionStats.recentReactions.unshift(recentReaction);
    
    // Keep only last 10 reactions
    if (this.reactionStats.recentReactions.length > 10) {
      this.reactionStats.recentReactions.pop();
    }
  }

  private updateTopReaction(): void {
    const allReactions = [...this.quickReactions, ...this.singerReactions];
    const topReaction = allReactions.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );
    
    this.reactionStats.topReaction = topReaction.emoji;
  }
}