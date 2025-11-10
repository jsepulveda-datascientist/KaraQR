import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'footer-widget',
    standalone: true,
    template: `<div class="grid grid-cols-12 gap-4 lg:gap-0 lg:grid-nogutter pb-12">
        <div class="col-span-12 lg:col-span-3">
            <div class="w-full text-white flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <i class="pi pi-microphone text-primary-400 text-2xl"></i>
                    <h1 class="m-0 font-bold text-xl">KaraQR</h1>
                </div>
                <p class="m-0 text-base lg:text-sm text-surface-300">
                    La plataforma de karaoke más fácil y profesional. 
                    Convierte cualquier evento en una experiencia memorable.
                </p>
                <div class="flex gap-4">
                    <a href="#"><i class="pi pi-github text-white text-xl! hover:text-primary-400"></i></a>
                    <a href="#"><i class="pi pi-twitter text-white text-xl! hover:text-primary-400"></i></a>
                    <a href="#"><i class="pi pi-linkedin text-white text-xl! hover:text-primary-400"></i></a>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3">
            <div class="w-full text-white flex flex-col gap-4">
                <h1 class="m-0 font-medium text-sm text-surface-400 uppercase tracking-wider">COMENZAR</h1>
                <a href="#" (click)="goToPairing()" class="cursor-pointer"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Emparejar TV</span></a>
                <a href="#" (click)="goToJoin()" class="cursor-pointer"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Unirse a Cola</span></a>
                <a href="#" (click)="goToRemote()" class="cursor-pointer"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Control Remoto</span></a>
                <a href="#" (click)="scrollToFeatures()" class="cursor-pointer"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Características</span></a>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3">
            <div class="w-full text-white flex flex-col gap-4">
                <h1 class="m-0 font-medium text-sm text-surface-400 uppercase tracking-wider">SOPORTE</h1>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Documentación</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Guías de Uso</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">FAQ</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Contacto</span></a>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-3">
            <div class="w-full text-white flex flex-col gap-4">
                <h1 class="m-0 font-medium text-sm text-surface-400 uppercase tracking-wider">CASOS DE USO</h1>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Bares & Restaurantes</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Eventos Corporativos</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Fiestas Privadas</span></a>
                <a href="#"><span class="text-base lg:text-sm block text-white hover:text-primary-400">Bodas & Celebraciones</span></a>
            </div>
        </div>
        <div class="col-span-12 mt-8 pt-6 border-t border-surface-800">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span class="text-surface-400 text-sm">© 2025 KaraQR. Todos los derechos reservados.</span>
                <div class="flex gap-6">
                    <a href="#" class="text-surface-400 text-sm hover:text-white">Términos de Servicio</a>
                    <a href="#" class="text-surface-400 text-sm hover:text-white">Privacidad</a>
                </div>
            </div>
        </div>
    </div>`,
    host: {
        style: 'max-width: 1200px',
        class: 'w-full px-6'
    }
})
export class FooterWidget {
    
    constructor(private router: Router) {}
    
    goToPairing() {
        this.router.navigate(['/pairing']);
    }
    
    goToJoin() {
        this.router.navigate(['/join']);
    }
    
    goToRemote() {
        this.router.navigate(['/remote']);
    }
    
    scrollToFeatures() {
        const element = document.getElementById('features');
        element?.scrollIntoView({ behavior: 'smooth' });
    }
}
