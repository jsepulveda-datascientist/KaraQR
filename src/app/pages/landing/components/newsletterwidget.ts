import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';

@Component({
    selector: 'newsletter-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule],
    template: ` <div class="p-8 flex flex-col gap-6 items-center text-center lg:flex-row lg:text-left lg:items-center rounded-2xl w-full" style="background: linear-gradient(110.43deg, #868cd0 0.04%, #ff5759 100.11%); max-width: 1200px">
        <div class="flex flex-col gap-4 flex-1">
            <div class="flex items-center justify-center lg:justify-start gap-3">
                <i class="pi pi-microphone text-white text-3xl"></i>
                <h1 class="m-0 text-white font-bold text-3xl">¿Listo para tu karaoke?</h1>
            </div>
            <p class="m-0 text-white text-lg opacity-90">
                Transforma tu evento en una experiencia inolvidable. KaraQR hace que el karaoke sea fácil, 
                divertido y profesional. ¡Comienza ahora!
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-2">
                <button 
                    pButton 
                    pRipple 
                    class="bg-white! text-primary-600! border-white! rounded-lg! font-semibold! py-3! px-6! hover:bg-surface-100!" 
                    label="EMPAREJAR TV AHORA"
                    icon="pi pi-desktop"
                    (click)="goToPairing()">
                </button>
                <button 
                    pButton 
                    pRipple 
                    class="text-white! border! border-white! rounded-lg! font-semibold! py-3! px-6!" 
                    label="VER DEMO"
                    icon="pi pi-play"
                    outlined>
                </button>
            </div>
        </div>
        
        <div class="flex flex-col gap-3 text-center lg:text-right">
            <div class="flex flex-col gap-2">
                <span class="text-white font-semibold text-lg">✨ Sin instalaciones</span>
                <span class="text-white font-semibold text-lg">📱 Solo código QR</span>
                <span class="text-white font-semibold text-lg">🎤 Karaoke profesional</span>
            </div>
            <div class="text-white text-sm opacity-75 mt-2">
                Perfecto para bares, eventos y fiestas
            </div>
        </div>
    </div>`,
    host: {
        class: 'py-12 px-6 mt-12 w-full flex justify-center'
    }
})
export class NewsletterWidget {
    
    constructor(private router: Router) {}
    
    goToPairing() {
        this.router.navigate(['/pairing']);
    }
}
