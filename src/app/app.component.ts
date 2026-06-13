import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const DEFAULT_PATRIMONIO = 75000;
const CONFIG_URL = 'config.php';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'trading-position-calculator';

  patrimonio: number | null = DEFAULT_PATRIMONIO;
  patrimonioTemporal: number | null = null;
  editandoPatrimonio: boolean = false;

  riesgoPorcentaje: number = 0.005;
  precioCompra: number | null = null;
  stop: number | null = null;
  riesgoCalculado: number | null = null;

  volatilidadPorcentaje: number = 0.005;
  atr: number | null = null;
  volatilidadCalculada: number | null = null;

  capitalPorcentaje: number = 0.01;
  capitalCalculado: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ patrimonio: number }>(CONFIG_URL).subscribe({
      next: (data) => {
        this.patrimonio = data.patrimonio;
        this.calcularTodo();
      },
      error: () => {
        this.patrimonio = DEFAULT_PATRIMONIO;
        this.calcularTodo();
      }
    });
  }

  iniciarEdicion(): void {
    this.patrimonioTemporal = this.patrimonio;
    this.editandoPatrimonio = true;
  }

  cancelarEdicion(): void {
    this.editandoPatrimonio = false;
    this.patrimonioTemporal = null;
  }

  guardarPatrimonio(): void {
    if (this.patrimonioTemporal === null) return;
    const confirmado = confirm(`¿Confirmas cambiar el patrimonio dedicado a ${this.patrimonioTemporal.toLocaleString('es-ES')} €?`);
    if (!confirmado) return;
    this.patrimonio = this.patrimonioTemporal;
    this.editandoPatrimonio = false;
    this.patrimonioTemporal = null;
    this.http.post(CONFIG_URL, { patrimonio: this.patrimonio }).subscribe();
    this.calcularTodo();
  }

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
    if (this.patrimonio !== null && this.precioCompra !== null && this.stop !== null) {
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
}
