import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { LoginServiceService } from 'src/app/Service/login-service.service';

interface Provider {
  id: number;
  name: string;
  type: string;
  isActive?: boolean;
  order?: number;
  [k: string]: any;
}

@Component({
  selector: 'app-registration-screen',
  templateUrl: './registration-screen.component.html'
})
export class RegistrationScreenComponent implements OnInit {

  form!: FormGroup;

  // raw API data
  authProvidersData: Provider[] = [];

  // stable options used in templates (do NOT recreate these on each CD)
  typesOptions: Array<{ label: string; value: string }> = [];
  namesByTypeMap: { [type: string]: Array<{ label: string; value: number }> } = {};

  constructor(private fb: FormBuilder, private loginService: LoginServiceService) {}

  ngOnInit(): void {
    this.initForm();
    this.getAuthProviderData();
  }

  // ------------------ FORM INIT ------------------
  private initForm() {
    this.form = this.fb.group({
      mode: ['Regular_Login', Validators.required],

      // general group
      general: this.fb.group({
        type: [null, Validators.required],
        name: [null, Validators.required]    // stores provider id (number)
      }),

      // arrays
      twoFactor: this.fb.array([]),     // FormArray<FormGroup>
      multiFactor: this.fb.array([])
    });

    // when general.type changes -> clear/patch name (keeps consistent values)
    (this.form.get('general') as FormGroup).get('type')!.valueChanges.subscribe((t) => {
      this.onGeneralTypeChange(t);
    });

    // when mode changes -> ensure arrays / defaults
    this.form.get('mode')!.valueChanges.subscribe((m) => {
      this.onModeChange(m);
    });
  }

  // ------------------ API ------------------
  private getAuthProviderData() {
    this.loginService.getAuthProviders().subscribe((res: any) => {
      this.authProvidersData = Array.isArray(res) ? res : [];

      // build stable options
      this.buildOptionsFromData();

      // auto-select mode and prefill controls/arrays based on data
      this.autoSelectAndPrefill();
    });
  }

  // build typesOptions and namesByTypeMap once (stable references)
  private buildOptionsFromData() {
    const types = Array.from(new Set(this.authProvidersData.map(p => p.type ?? '').filter(Boolean)));
    this.typesOptions = types.map(t => ({ label: t, value: t }));

    this.namesByTypeMap = {};
    types.forEach(t => {
      this.namesByTypeMap[t] = this.authProvidersData
        .filter(p => p.type === t)
        .map(p => ({ label: p.name, value: p.id }));
    });
  }

  // ------------------ MODE / PREFILL ------------------
  private autoSelectAndPrefill() {
    if (!this.authProvidersData.length) return;

    // consider only active providers for auto logic (you can change if needed)
    const activeProviders = this.authProvidersData.filter(p => p.isActive !== false).sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    const activeTypes = Array.from(new Set(activeProviders.map(p => p.type)));

    if (activeTypes.length === 1) {
      // general
      const t = activeTypes[0];
      const first = this.namesByTypeMap[t]?.[0];
      this.form.patchValue({ mode: 'Regular_Login' });
      if (first) {
        this.form.get('general')!.patchValue({ type: t, name: first.value });
      } else {
        this.form.get('general')!.patchValue({ type: t, name: null });
      }
    } else if (activeTypes.length === 2) {
      // 2 factor: create exactly two rows (prefill with first providers)
      this.form.patchValue({ mode: 'Two_Factor_Authentication' });
      this.buildTwoFactorFromProviders(activeProviders.slice(0, 2));
    } else if (activeTypes.length > 2) {
      // multi: create rows for active providers (prefill)
      this.form.patchValue({ mode: 'Multi_Factor' });
      this.buildMultiFactorFromProviders(activeProviders);
    } else {
      // fallback -> leave as General but don't prefill
    }
  }

  // ------------------ GENERAL HANDLERS ------------------
  private onGeneralTypeChange(type: string | null) {
    const general = this.form.get('general') as FormGroup;
    if (!type) {
      general.get('name')!.setValue(null);
      return;
    }

    // if current name doesn't belong to new type, set to first available provider id
    const currentNameId = general.get('name')!.value;
    const providers = this.namesByTypeMap[type] ?? [];
    const exists = providers.some(p => p.value === currentNameId);
    if (!exists) {
      general.get('name')!.setValue(providers.length ? providers[0].value : null);
    }
  }

  // ------------------ FORM ARRAY HELPERS ------------------
  get twoFactor(): FormArray { return this.form.get('twoFactor') as FormArray; }
  get multiFactor(): FormArray { return this.form.get('multiFactor') as FormArray; }

  private createRow(initial?: { type?: string; nameId?: number }) {
    const g = this.fb.group({
      type: [initial?.type ?? null, Validators.required],
      name: [initial?.nameId ?? null, Validators.required]
    });

    // when type changes on this row, clear/patch the name for that row
    g.get('type')!.valueChanges.subscribe((type: string | null) => {
      const nameCtrl = g.get('name')!;
      if (!type) {
        nameCtrl.setValue(null);
        return;
      }
      const providers = this.namesByTypeMap[type] ?? [];
      const exists = providers.some(p => p.value === nameCtrl.value);
      if (!exists) {
        nameCtrl.setValue(providers.length ? providers[0].value : null);
      }
    });

    return g;
  }

  addTwoFactorRow(initial?: { type?: string; nameId?: number }) {
    this.twoFactor.push(this.createRow(initial));
  }

  addMultiRow(initial?: { type?: string; nameId?: number }) {
    this.multiFactor.push(this.createRow(initial));
  }

  removeTwoFactorRow(index: number) {
    if (this.twoFactor.length > 0) this.twoFactor.removeAt(index);
  }

  removeMultiRow(index: number) {
    if (this.multiFactor.length > 0) this.multiFactor.removeAt(index);
  }

  // ------------------ BUILD FROM PROVIDERS ------------------
  private buildTwoFactorFromProviders(providers: Provider[]) {
    this.twoFactor.clear();
    providers.forEach(p => this.addTwoFactorRow({ type: p.type, nameId: p.id }));
    // ensure exactly 2 rows if not enough, add empties
    while (this.twoFactor.length < 2) this.addTwoFactorRow();
  }

  private buildMultiFactorFromProviders(providers: Provider[]) {
    this.multiFactor.clear();
    providers.forEach(p => this.addMultiRow({ type: p.type, nameId: p.id }));
    if (this.multiFactor.length === 0) this.addMultiRow(); // at least one row
  }

  private onModeChange(mode: string) {
    // called whenever radio mode changes; ensure arrays exist for that mode
    if (mode === 'Two_Factor_Authentication') {
      if (this.twoFactor.length === 0) this.addTwoFactorRow(), this.addTwoFactorRow();
    }
    if (mode === 'Multi_Factor') {
      if (this.multiFactor.length === 0) this.addMultiRow();
    }
  }

  // ------------------ OPTIONS ACCESSORS (used in template) ------------------
  // typesOptions and namesByTypeMap are stable arrays/objects,
  // so using them directly in template won't recreate arrays every CD.

  // ------------------ SUBMIT ------------------
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Form invalid', this.form.value);
      return;
    }
    console.log('FORM VALUE ->', this.form.value);
  }
}
