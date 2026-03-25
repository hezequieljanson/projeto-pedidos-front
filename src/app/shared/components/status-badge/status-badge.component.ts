import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { OrderStatus } from '../../../core/models';

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string }> = {
  pending:    { label: 'Pendente',    classes: 'badge--pending' },
  processing: { label: 'Processando', classes: 'badge--processing' },
  shipped:    { label: 'Enviado',     classes: 'badge--shipped' },
  delivered:  { label: 'Entregue',   classes: 'badge--delivered' },
  cancelled:  { label: 'Cancelado',  classes: 'badge--cancelled' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'badge ' + config().classes">{{ config().label }}</span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<OrderStatus>();
  config = () => STATUS_CONFIG[this.status()] ?? { label: this.status(), classes: 'badge--default' };
}
