export type ApplicationError = {
  name: string;
  message: string;
};

export type RequestError = {
  status: number;
  data: object | null;
  statusText: string;
  name: string;
  message: string;
};

export type CepInfo = {
  logradouro:  string;
  complemento: string;
  bairro:      string;
  cidade:      string;
  uf:          string;
}
