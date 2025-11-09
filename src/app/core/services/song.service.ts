import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  
  private readonly baseSongs = [
    'Ironic - Alanis Morissette',
    'Wonderwall - Oasis',
    'Creep - Radiohead',
    'Zombie - The Cranberries',
    'Don\'t Speak - No Doubt',
    'Smells Like Teen Spirit - Nirvana',
    'Black Hole Sun - Soundgarden',
    'Losing My Religion - R.E.M.',
    'Under the Bridge - Red Hot Chili Peppers',
    'Everybody Hurts - R.E.M.',
    'Nothing Else Matters - Metallica',
    'Sweet Child O\' Mine - Guns N\' Roses',
    'Hotel California - Eagles',
    'Bohemian Rhapsody - Queen',
    'Stairway to Heaven - Led Zeppelin',
    'Imagine - John Lennon',
    'Hey Jude - The Beatles',
    'Let It Be - The Beatles',
    'Yesterday - The Beatles',
    'Come As You Are - Nirvana'
  ];

  /**
   * Busca canciones que coincidan con el término de búsqueda
   * @param term Término de búsqueda
   * @returns Observable con array de canciones filtradas
   */
  search(term: string): Observable<string[]> {
    if (!term || term.length < 2) {
      return of([]);
    }

    const filteredSongs = this.baseSongs.filter(song =>
      song.toLowerCase().includes(term.toLowerCase())
    );

    // Simular delay de red para hacer más realista
    return of(filteredSongs).pipe(
      delay(300),
      map(songs => songs.slice(0, 10)) // Limitar resultados para mejor UX
    );
  }

  /**
   * Obtiene todas las canciones disponibles
   * @returns Observable con todas las canciones
   */
  getAllSongs(): Observable<string[]> {
    return of([...this.baseSongs]);
  }
}