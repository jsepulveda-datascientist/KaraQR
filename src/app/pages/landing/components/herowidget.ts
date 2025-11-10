import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule],
    template: `<div class="hidden lg:block absolute top-0 right-0 bottom-0 left-0 parallax__layer__0">
            <img [attr.draggable]="false" src="/images/landing/layer-0-opt.jpg" class="w-full h-full block absolute bottom-0" />
        </div>
        <div class="hidden lg:block absolute top-0 right-0 bottom-0 left-0 parallax__layer__1">
            <img [attr.draggable]="false" src="/images/landing/layer-1-opt.png" class="w-full block absolute bottom-0" />
        </div>

        <div class="hidden lg:flex absolute right-0 bottom-0 left-0 parallax__layer__3 justify-center items-center" style="top: 15%; z-index: 10">
            <div class="text-center bg-black/20 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-4">
                <div class="flex items-center justify-center mb-4">
                    <i class="pi pi-microphone text-white text-6xl mr-4"></i>
                    <h1 class="m-0 text-8xl font-bold text-white tracking-wider drop-shadow-lg">KaraQR</h1>
                </div>
                <h2 class="m-0 text-3xl text-white font-light tracking-wide opacity-90 drop-shadow-md mb-4">
                    Karaoke Inteligente para el Siglo XXI
                </h2>
                <p class="text-white text-xl max-w-2xl mx-auto opacity-90 drop-shadow-md mb-6">
                    Transforma cualquier evento en una experiencia de karaoke profesional. 
                    Sin instalaciones, sin complicaciones. Solo código QR y ¡a cantar!
                </p>
                
                <!-- Botones dentro del mismo contenedor -->
                <div class="flex gap-4 justify-center">
                    <button
                        pButton
                        pRipple
                        label="EMPAREJAR TV"
                        icon="pi pi-desktop"
                        (click)="goToPairing()"
                        style="backdrop-filter: blur(10px)"
                        class="text-surface-0! bg-primary/40! text-lg! px-8! py-4! font-semibold! hover:bg-primary! hover:text-white! rounded-xl! border-primary/40! border! drop-shadow-lg"
                    ></button>
                    <button
                        pButton
                        pRipple
                        label="VER MÁS"
                        icon="pi pi-chevron-down"
                        (click)="handleScroll('features')"
                        style="backdrop-filter: blur(10px)"
                        class="text-surface-0! bg-white/30! text-lg! px-8! py-4! font-semibold! hover:bg-white! hover:text-surface-900! rounded-xl! border-white/40! border! drop-shadow-lg"
                        outlined
                    ></button>
                </div>
            </div>
        </div>
        <div class="hidden lg:block absolute top-0 right-0 bottom-0 left-0 parallax__layer__2">
            <img [attr.draggable]="false" src="/images/landing/layer-2-opt.png" class="w-full block absolute bottom-0" />
        </div>

        <div class="block lg:hidden h-112 bg-center bg-no-repeat bg-cover" style="top: 68px; background: url(/images/landing/landing-hero-image.jpg)">
            <div class="flex justify-center items-center h-full p-6">
                <div class="text-center">
                    <div class="flex items-center justify-center mb-3">
                        <i class="pi pi-microphone text-white text-4xl mr-3"></i>
                        <h1 class="m-0 text-5xl font-bold text-white">KaraQR</h1>
                    </div>
                    <h2 class="m-0 text-lg text-white font-light mb-3">
                        Karaoke Inteligente
                    </h2>
                    <p class="text-white text-sm mb-4 opacity-90">
                        Sin instalaciones. Sin complicaciones. Solo QR y ¡a cantar!
                    </p>
                    <div class="flex flex-col gap-2">
                        <button
                            pButton
                            pRipple
                            label="EMPAREJAR TV"
                            icon="pi pi-desktop"
                            (click)="goToPairing()"
                            style="backdrop-filter: blur(7px)"
                            class="text-surface-0! bg-primary/30! text-sm! font-semibold! hover:bg-primary! hover:text-white! rounded-xl! border-primary/30! border"
                        ></button>
                        <button
                            pButton
                            pRipple
                            label="VER MÁS"
                            (click)="handleScroll('parallaxBody')"
                            style="backdrop-filter: blur(7px)"
                            class="text-surface-0! bg-white/20! text-sm! font-semibold! hover:bg-white! hover:text-surface-900! rounded-xl! border-white/30! border"
                            outlined
                        ></button>
                    </div>
                </div>
            </div>
        </div>`,
    host: {
        style: 'display: contents;'
    }
})
export class HeroWidget {
    
    constructor(private router: Router) {}

    handleScroll(id: string) {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    }

    goToPairing() {
        this.router.navigate(['/pairing']);
    }
}
