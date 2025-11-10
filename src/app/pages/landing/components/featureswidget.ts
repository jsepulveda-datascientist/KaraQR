import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'features-widget',
    imports: [CommonModule],
    template: `<div id="features" class="pt-8" style="background-color: #000">
        <div class="flex flex-col items-center gap-4">
            <div class="bg-surface-50 dark:bg-surface-800 text-white text-sm p-2 rounded-lg mb-6">CARACTERÍSTICAS</div>
            <span class="text-white text-2xl uppercase text-center">Todo lo que necesitas para karaoke profesional</span>
            <h1 class="m-0 text-6xl text-center" style="background: linear-gradient(110.43deg, #868cd0 0.04%, #ff5759 100.11%); background-clip: text; -webkit-background-clip: text; color: transparent">KaraQR</h1>
        </div>
        <div class="flex flex-col items-center">
            <div class="grid grid-cols-12 gap-4 pt-12 p-6" style="max-width: 1200px">
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl p-8 cursor-pointer h-full">
                        <i class="pi pi-qrcode text-4xl! text-white"></i>
                        <span class="font-semibold text-white">Acceso por QR</span>
                        <span class="text-white">Deja de pasearte con una hoja. Los usuarios se unen a la fila escaneando un código QR. Sin descargas ni registros complicados.</span>
                        <span class="text-primary-300 font-medium flex items-center">Súper fácil <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl p-8 cursor-pointer h-full">
                        <i class="pi pi-desktop text-4xl! text-white"></i>
                        <span class="font-semibold text-white">Proyección TV</span>
                        <span class="text-white">Simplemente abre el navegador web de tu Smart TV/proyector y enlázalo a KaraQR. No necesitas conexiones complicadas.</span>
                        <span class="text-primary-300 font-medium flex items-center">Para eventos <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl p-8 cursor-pointer h-full">
                        <i class="pi pi-youtube text-4xl! text-white"></i>
                        <span class="font-semibold text-white">YouTube Integrado</span>
                        <span class="text-white">Incorpora el enlace a tus karaokes favoritos de YouTube cuando pidas tu tema.</span>
                        <span class="text-primary-300 font-medium flex items-center">Música real <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl p-8 cursor-pointer h-full">
                        <i class="pi pi-refresh text-4xl! text-white"></i>
                        <span class="font-semibold text-white">Tiempo Real</span>
                        <span class="text-white">Cola actualizada en vivo. Los cambios se reflejan instantáneamente en todas las pantallas.</span>
                        <span class="text-primary-300 font-medium flex items-center">Sincronizado <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl text-white p-8 cursor-pointer h-full">
                        <i class="pi pi-cog text-4xl! text-white"></i>
                        <span class="font-semibold text-white">Fácil Setup</span>
                        <span class="text-white">Sin instalaciones complejas. Solo emparejar TV, compartir QR y comenzar el karaoke.</span>
                        <span class="text-primary-300 font-medium flex items-center">Sin complicaciones <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-4">
                    <div (mouseenter)="handleMouseEnter($event)" (mouseleave)="handleMouseLeave($event)" class="flex justify-center flex-col gap-4 border border-surface-50 dark:border-surface-800 rounded-2xl text-white p-8 cursor-pointer h-full">
                        <i class="pi pi-users text-4xl!"></i>
                        <span class="font-semibold">Multi-Pantallas</span>
                        <span>Soporte para múltiples pantallas, no necesitas duplicar señales, tampoco cables.</span>
                        <span class="text-primary-300 font-medium flex items-center">Escalable <i class="pi pi-arrow-right ml-2"></i></span>
                    </div>
                </div>
            </div>

            <!-- Casos de uso -->
            <div class="w-full max-w-4xl mx-auto p-6 mt-8">
                <h2 class="text-white text-3xl text-center mb-8">Perfecto para cualquier evento</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center p-6 bg-surface-900 rounded-xl">
                        <i class="pi pi-home text-3xl text-primary-400 mb-4"></i>
                        <h3 class="text-white text-lg font-semibold mb-2">Bares & Restaurantes</h3>
                        <p class="text-surface-300">Atrae más clientes con noches de karaoke profesionales</p>
                    </div>
                    <div class="text-center p-6 bg-surface-900 rounded-xl">
                        <i class="pi pi-heart text-3xl text-primary-400 mb-4"></i>
                        <h3 class="text-white text-lg font-semibold mb-2">Fiestas Privadas</h3>
                        <p class="text-surface-300">Convierte cualquier reunión en una experiencia memorable</p>
                    </div>
                    <div class="text-center p-6 bg-surface-900 rounded-xl">
                        <i class="pi pi-briefcase text-3xl text-primary-400 mb-4"></i>
                        <h3 class="text-white text-lg font-semibold mb-2">Eventos Corporativos</h3>
                        <p class="text-surface-300">Team building y entretenimiento para tu empresa</p>
                    </div>
                </div>
            </div>

            <ng-content />
        </div>
    </div>`
})
export class FeaturesWidget {
    
    constructor(private router: Router) {}

    handleMouseEnter(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.background = 'linear-gradient(110.43deg, rgba(134,140,208,.5) 0.04%, rgba(255,87,89,.5) 100.11%)';
        }
    }

    handleMouseLeave(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.background = 'unset';
        }
    }
}
