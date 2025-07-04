// ----------------------------------------
// 📦 IMPORTAÇÕES
// ----------------------------------------
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

// ----------------------------------------
// 🧩 INTERFACES
// ----------------------------------------
export interface Producer {
  id: number;
  cpfOrCnpj: string;
  name: string;
  createdAt: string;
}

interface Farm {
  id: number;
  name: string;
  city: string;
  state: string;
  totalArea: number;
  arableArea: number;
  vegetationArea: number;
  createdAt: string;
  updatedAt: string;
  crops: FarmCrop[];
}

interface FarmCrop {
  id: number;
  name: string;
  variety: string;
  harvestYear: number;
  plantingDate: string;
  harvestDate: string;
  area: number;
  yield: number;
  farmId: number;
}

interface Crop {
  name: string;
  variety: string;
  harvestYear: number;
  plantingDate: string;
  harvestDate: string;
  area: number;
  yield: number;
  farmId: number;
}


// ----------------------------------------
// 🧱 COMPONENTE
// ----------------------------------------
@Component({
  selector: 'app-producer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './producer.html',
  styleUrls: ['./producer.scss'],
  providers: [FormBuilder]
})
export class Producer implements OnInit {

  // ----------------------------------------
  // 🔢 ESTADO DA TELA
  // ----------------------------------------
  farmForm!: FormGroup;
  
  producers: any[] = [];
  isLoading = true;
  errorMessage: string = '';
  selectedProducer: any = null;
  
  newProducer = { cpfOrCnpj: '', name: '' };
  editProducerData = { id: 0, cpfOrCnpj: '', name: '' };

  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  searchTerm: string = '';
  selectedFarmCrops: any[] = [];
  selectedFarm: any = null;
  
  @ViewChild('cropModal', { static: false }) cropModal: any;
  @ViewChild('farmModal', { static: false }) farmModal: any;

  newCrop: Crop = {
    name: '',
    variety: '',
    harvestYear: new Date().getFullYear(),
    plantingDate: '',
    harvestDate: '',
    area: 0,
    yield: 0,
    farmId: 0
  };


  // ----------------------------------------

  // 🧪 CONSTRUTOR / DEPENDÊNCIAS
  // ----------------------------------------
  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  // ----------------------------------------
  // 🚀 CICLO DE VIDA
  // ----------------------------------------
  ngOnInit(): void {
    this.loadProducers();
    this.cdRef.detectChanges();
  }

  // ----------------------------------------
  // 📥 CRIAÇÃO
  // ----------------------------------------


  submitFarm(modal: any): void {
    if (this.farmForm.invalid) return;

    const values = this.farmForm.value;
    const payload = {
      ...values,
      producerId: this.selectedProducer.id
    };

    this.apiService.post('farms/create', payload).subscribe({
      next: () => {
        alert('Fazenda cadastrada com sucesso!');
        modal.close();
        this.onGet(this.selectedProducer, null); // Atualiza dados
      },
      error: (err) => {
        console.error('Erro ao cadastrar fazenda:', err);
        alert(err.error?.message || 'Erro ao cadastrar fazenda.');
      }
    });
  }


  onCreateCrop(modalRef: any): void {
    const payload = [{
      ...this.newCrop,
      farmId: this.selectedFarm?.id,
      plantingDate: new Date(this.newCrop.plantingDate).toISOString(),
      harvestDate: new Date(this.newCrop.harvestDate).toISOString()
    }];

    this.apiService.post<any>('crops/create', payload).subscribe({
      next: () => {
        alert('Cultura registrada com sucesso!');
        modalRef.close();
        this.newCrop = {
          name: '',
          variety: '',
          harvestYear: new Date().getFullYear(),
          plantingDate: '',
          harvestDate: '',
          area: 0,
          yield: 0,
          farmId: this.selectedFarm?.id || 0
        };
        this.openCropModal(this.selectedFarm); // 🔄 Atualiza as culturas da fazenda
      },
      error: (err) => {
        console.error('Erro ao registrar cultura:', err);
        alert(err.error?.message || 'Erro ao registrar cultura.');
      }
    });
  }



  onCreate(): void {
    if (!this.newProducer.cpfOrCnpj || !this.newProducer.name) {
      alert('Preencha todos os campos!');
      return;
    }

    this.apiService.post<any>('producers/create', this.newProducer).subscribe({
      next: (res) => {
        alert('Produtor criado com sucesso!');
        this.newProducer = { cpfOrCnpj: '', name: '' };
        this.loadProducers();
      },
      error: (err) => {
        console.error('Erro ao criar produtor:', err);
        alert(err.error?.message || 'Erro ao criar produtor.');
      }
    });
  }

  // ----------------------------------------
  // ✏️ EDIÇÃO
  // ----------------------------------------
  onUpdate(): void {
    if (!this.editProducerData.cpfOrCnpj || !this.editProducerData.name) {
      alert('Preencha todos os campos!');
      return;
    }

    const updatedData = {
      cpfOrCnpj: this.editProducerData.cpfOrCnpj,
      name: this.editProducerData.name
    };

    this.apiService.put(`producers/update/${this.editProducerData.id}`, updatedData)
      .subscribe({
        next: () => {
          alert('Produtor atualizado com sucesso!');
          this.loadProducers();
        },
        error: (err) => {
          console.error('Erro ao atualizar:', err);
          alert(err.error?.message || 'Erro ao atualizar produtor');
        }
      });
  }

  openCreateFarmModal(modalTemplate: any): void {
    if (!this.selectedProducer?.id) {
      alert('Produtor não selecionado!');
      return;
    }

    this.farmForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      totalArea: [0, [Validators.required, Validators.min(0.01)]],
      arableArea: [0, [Validators.required, Validators.min(0)]],
      vegetationArea: [0, [Validators.required, Validators.min(0)]]
    });

    this.modalService.open(modalTemplate);
  }


  // ----------------------------------------
  // ❌ EXCLUSÃO
  // ----------------------------------------
  onDelete(producerId: number): void {
    if (!confirm('Tem certeza que deseja excluir este produtor?')) return;
    console.log('Enviando ID para exclusão:', producerId);
    this.apiService.delete(`producers/delete/${producerId}`).subscribe({
      next: () => {
        alert('Produtor excluído com sucesso!');
        this.loadProducers();
      },
      error: (err) => {
        console.error('Erro completo:', err);
        alert('Erro ao excluir produtor: ' + (err.error?.message || err.message));
      }
    });
  }

  // ----------------------------------------
  // 📄 DETALHAMENTO
  // ----------------------------------------
  onGet(producer: any, modalTemplate: any): void {
    this.apiService.get<any>(`producers/${producer.id}`).subscribe({
      next: (res) => {
        this.selectedProducer = res;
        this.cdRef.detectChanges();
        this.openModal(modalTemplate);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do produtor:', err);
        alert('Erro ao carregar dados do produtor.');
      }
    });
  }

  // ----------------------------------------
  // 🌽 CULTURAS POR FAZENDA
  // ----------------------------------------
  openCropModal(farm: any): void {
    console.log("Objeto enviado para o modal:", farm);
    this.selectedFarm = farm;
    this.apiService.get<any[]>(`crops/by-farm/${farm.id}`).subscribe(
      (crops) => {
        console.log("Culturas da fazenda:", crops);
        this.selectedFarmCrops = Array.isArray(crops) ? crops : [];
        this.cdRef.detectChanges();
        this.modalService.open(this.cropModal);
      },
      (error) => {
        console.error("Erro ao buscar culturas:", error);
        this.selectedFarmCrops = [];
        this.cdRef.detectChanges();
        this.modalService.open(this.cropModal);
      }
    );
  }

  // ----------------------------------------
  // 📄 MODAIS
  // ----------------------------------------
  openModal(modalTemplate: any): void {
    this.modalService.open(modalTemplate, {
      ariaLabelledBy: 'producerModalLabel',
      size: 'lg'
    });
  }

  openCreateCropModal(modalTemplate: any): void {
    this.newCrop = {
      name: '',
      variety: '',
      harvestYear: new Date().getFullYear(),
      plantingDate: '',
      harvestDate: '',
      area: 0,
      yield: 0,
      farmId: this.selectedFarm?.id || 0
    };
    this.modalService.open(modalTemplate);
  }


  openCreateModal(modalTemplate: any): void {
    this.newProducer = { cpfOrCnpj: '', name: '' };
    this.modalService.open(modalTemplate);
  }

  openEditModal(producer: any, modalTemplate: any): void {
    this.editProducerData = {
      id: producer.id,
      cpfOrCnpj: producer.cpfOrCnpj,
      name: producer.name
    };
    this.modalService.open(modalTemplate);
  }

  onSubmit(modal: any): void {
    this.onCreate();
    modal.close();
  }

  // ----------------------------------------
  // 🔁 LISTAGEM E PAGINAÇÃO
  // ----------------------------------------
  private loadProducers(page: number = 1, searchTerm: string = ''): void {
    this.isLoading = true;
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('Token não encontrado. Faça login novamente.');
      this.router.navigateByUrl('signin');
      return;
    }

    this.apiService.get<any>(`producers/list?page=${page}&limit=12`).subscribe({
      next: (res) => {
        if (searchTerm.trim()) {
          this.producers = res.producers.filter((producer: Producer) =>
            producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producer.cpfOrCnpj.includes(searchTerm)
          );
        } else {
          this.producers = res.producers;
        }

        this.totalItems = res.total;
        this.totalPages = res.lastPage;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigateByUrl('signin');
          localStorage.removeItem('accessToken');
        } else {
          alert('Erro ao consultar os dados dos produtores.');
        }
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducers(this.currentPage, this.searchTerm);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducers(this.currentPage, this.searchTerm);
    }
  }

  onSearch(): void {
    this.loadProducers(this.currentPage, this.searchTerm);
  }
}
