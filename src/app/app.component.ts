import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type Nivel = 'principiante' | 'intermedio' | 'experto';

const DEFAULT_PATRIMONIO = 75000;
const DEFAULT_NIVEL: Nivel = 'principiante';
const CONFIG_URL = 'config.php';

const PORCENTAJES: Record<Nivel, { riesgo: number; volatilidad: number; capital: number }> = {
  principiante: { riesgo: 0.005,  volatilidad: 0.005,  capital: 0.01 },
  intermedio:   { riesgo: 0.01,   volatilidad: 0.0075, capital: 0.02 },
  experto:      { riesgo: 0.02,   volatilidad: 0.015,  capital: 0.05 },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'trading-position-calculator';

  private analizarUrl: string = `${window.location.protocol}//${window.location.hostname}:8765/analizar`;

  ticker: string = '';
  analizando: boolean = false;
  errorTicker: string | null = null;
  tickerActivo: string | null = null;
  nombreEmpresa: string | null = null;
  fechaDatos: string | null = null;

  patrimonio: number | null = DEFAULT_PATRIMONIO;
  patrimonioTemporal: number | null = null;
  editandoPatrimonio: boolean = false;

  nivel: Nivel = DEFAULT_NIVEL;
  editandoNivel: boolean = false;

  riesgoPorcentaje: number = PORCENTAJES[DEFAULT_NIVEL].riesgo;
  precioCompra: number | null = null;
  stop: number | null = null;
  riesgoCalculado: number | null = null;

  volatilidadPorcentaje: number = PORCENTAJES[DEFAULT_NIVEL].volatilidad;
  atr: number | null = null;
  volatilidadCalculada: number | null = null;

  capitalPorcentaje: number = PORCENTAJES[DEFAULT_NIVEL].capital;
  capitalCalculado: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ patrimonio: number; nivel: Nivel; tws_url?: string }>(CONFIG_URL).subscribe({
      next: (data) => {
        this.patrimonio = data.patrimonio;
        this.aplicarNivel(data.nivel ?? DEFAULT_NIVEL);
        if (data.tws_url) this.analizarUrl = `${data.tws_url}/analizar`;
        this.calcularTodo();
      },
      error: () => {
        this.patrimonio = DEFAULT_PATRIMONIO;
        this.calcularTodo();
      }
    });
  }

  get nivelLabel(): string {
    return this.nivel.charAt(0).toUpperCase() + this.nivel.slice(1);
  }

  // Patrimonio
  iniciarEdicion(): void {
    this.patrimonioTemporal = this.patrimonio;
    this.editandoPatrimonio = true;
  }

  cancelarEdicion(): void {
    this.editandoPatrimonio = false;
    this.patrimonioTemporal = null;
  }

  guardarPatrimonio(): void {
    if (this.patrimonioTemporal === null || this.patrimonioTemporal <= 0) return;
    const confirmado = confirm(`¿Confirmas cambiar el patrimonio dedicado a ${this.patrimonioTemporal.toLocaleString('es-ES')} €?`);
    if (!confirmado) return;
    this.patrimonio = this.patrimonioTemporal;
    this.editandoPatrimonio = false;
    this.patrimonioTemporal = null;
    this.http.post(CONFIG_URL, { patrimonio: this.patrimonio }).subscribe();
    this.calcularTodo();
  }

  // Nivel
  iniciarEdicionNivel(): void {
    this.editandoNivel = true;
  }

  cancelarEdicionNivel(): void {
    this.editandoNivel = false;
  }

  seleccionarNivel(nuevo: Nivel): void {
    if (nuevo === this.nivel) { this.editandoNivel = false; return; }
    const label = nuevo.charAt(0).toUpperCase() + nuevo.slice(1);
    const confirmado = confirm(`¿Confirmas cambiar el nivel de experiencia a ${label}?`);
    if (!confirmado) return;
    this.aplicarNivel(nuevo);
    this.editandoNivel = false;
    this.http.post(CONFIG_URL, { nivel: this.nivel }).subscribe();
    this.calcularTodo();
  }

  private aplicarNivel(nivel: Nivel): void {
    this.nivel = nivel;
    this.riesgoPorcentaje = PORCENTAJES[nivel].riesgo;
    this.volatilidadPorcentaje = PORCENTAJES[nivel].volatilidad;
    this.capitalPorcentaje = PORCENTAJES[nivel].capital;
  }

  // Resultados
  get cardMinima(): 'riesgo' | 'volatilidad' | 'capital' | null {
    if (this.riesgoAcciones === null || this.volatilidadAcciones === null || this.capitalAcciones === null) {
      return null;
    }
    const min = Math.min(this.riesgoAcciones, this.volatilidadAcciones, this.capitalAcciones);
    if (this.riesgoAcciones === min) return 'riesgo';
    if (this.volatilidadAcciones === min) return 'volatilidad';
    return 'capital';
  }

  get riesgoAcciones(): number | null {
    return this.riesgoCalculado !== null ? Math.floor(this.riesgoCalculado) : null;
  }

  get volatilidadAcciones(): number | null {
    return this.volatilidadCalculada !== null ? Math.floor(this.volatilidadCalculada) : null;
  }

  get capitalAcciones(): number | null {
    return this.capitalCalculado !== null ? Math.floor(this.capitalCalculado) : null;
  }

  calcularTodo(): void {
    this.calcularRiesgo();
    this.calcularVolatilidad();
    this.calcularCapital();
  }

  calcularRiesgo(): void {
    if (this.patrimonio !== null && this.precioCompra !== null && this.stop !== null && this.precioCompra > this.stop) {
      this.riesgoCalculado = (this.patrimonio * this.riesgoPorcentaje) / (this.precioCompra - this.stop);
    } else {
      this.riesgoCalculado = null;
    }
  }

  calcularVolatilidad(): void {
    if (this.patrimonio !== null && this.atr !== null) {
      this.volatilidadCalculada = (this.patrimonio * this.volatilidadPorcentaje) / this.atr;
    } else {
      this.volatilidadCalculada = null;
    }
  }

  calcularCapital(): void {
    if (this.patrimonio !== null && this.precioCompra !== null) {
      this.capitalCalculado = (this.patrimonio * this.capitalPorcentaje) / this.precioCompra;
    } else {
      this.capitalCalculado = null;
    }
  }

  // Ticker / TWS
  analizarTicker(): void {
    const symbol = this.ticker.trim().toUpperCase();
    if (!symbol) return;
    this.analizando = true;
    this.errorTicker = null;
    this.http.get<{ cierre: number; atr_14: number; fecha: string; nombre?: string }>(`${this.analizarUrl}/${symbol}`).subscribe({
      next: (data) => {
        this.precioCompra = data.cierre;
        this.atr = data.atr_14;
        this.tickerActivo = symbol;
        this.fechaDatos = data.fecha ?? null;
        this.nombreEmpresa = data.nombre ?? null;
        this.analizando = false;
        this.calcularTodo();
      },
      error: (err) => {
        this.errorTicker = err.error?.error ?? 'Error conectando con TWS';
        this.nombreEmpresa = null;
        this.fechaDatos = null;
        this.analizando = false;
      }
    });
  }
}
