import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  url: string = "http://localhost:4000";
  url_posts: string = "http://localhost:3000";
  url_posts_media: string = `${this.url_posts}/`;
  url_avatars: string = `${this.url}/uploads/avatars/`;

  posts = [
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' }
  ];

  myPosts: any = [];

  currentUserInfo: any = {}; // Información del usuario
  editProfileData: any = {}; // Datos para el formulario de edición
  isEditProfileModalOpen: boolean = false; // Estado para controlar la visibilidad del modal
  selectedImage: string | ArrayBuffer | null = null; // Para almacenar la previsualización de la imagen seleccionada
  isImageSelectorModalOpen: boolean = false; // Controla la visibilidad del modal de selección de imagen
  usuariosUmg: any[] = []; // Array para almacenar la respuesta del API
  following: any[] = []; // Array para almacenar la respuesta del API de following

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserPosts();
    this.loadUserList();
    this.loadFollowing();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
    this.loadUserPosts();
    this.loadUserList();
    this.loadFollowing();
  }

  // Método para cargar el perfil del usuario
  loadUserProfile() {
    const userId = sessionStorage.getItem('id'); // Obtén el id del usuario de sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (userId && token) {
      const url = `${this.url}/api/user/profile/${userId}`;
      const headers = new HttpHeaders().set('Authorization', token);

      // Realiza la solicitud HTTP para obtener la información del perfil
      this.http.get(url, { headers }).subscribe(
        async (response: any) => {
          console.log(response)
          if (response.status === 'error') {
            // Si el API devuelve un error, muestra el alert
            await this.showSessionExpiredAlert();
          } else {
            // Si todo está bien, asigna la información del usuario
            this.currentUserInfo = response.user;
          }
        },
        (error) => {
          console.error("Error al cargar el perfil del usuario:", error);
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }

  loadUserPosts() {
    const userId = sessionStorage.getItem('id'); // Obtén el id del usuario de sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (userId && token) {
        const url = `${this.url_posts}/api/images/publications/user/${userId}`;
        const headers = new HttpHeaders().set('Authorization', token);

        this.http.get(url, { headers }).subscribe(
            (response: any) => {
                this.myPosts = response;
                console.log(response)
            },
            async (error) => {
                const alert = await this.alertController.create({
                    header: 'Error',
                    message: 'Ocurrió un error al cargar las publicaciones del usuario.',
                    buttons: ['Aceptar']
                });
                await alert.present();
            }
        );
    } else {
        console.error("No se encontró el id o token en sessionStorage");
    }
  }

  // Método para mostrar el alert de sesión expirada
  async showSessionExpiredAlert() {
    const alert = await this.alertController.create({
      header: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            // Limpiar sessionStorage y recargar la página
            sessionStorage.clear();
            window.location.reload();
          }
        }
      ]
    });

    await alert.present();
  }

  // Abrir el modal de edición de perfil
  openEditProfileModal() {
    this.editProfileData = { ...this.currentUserInfo }; // Copia los datos actuales del perfil
    this.isEditProfileModalOpen = true; // Abre el modal
  }

  // Cerrar el modal de edición de perfil
  closeEditProfileModal() {
    this.isEditProfileModalOpen = false; // Cierra el modal
  }

  // Guardar cambios del perfil
  async saveProfile() {
    if (!this.editProfileData.name || !this.editProfileData.nick) {
        const alert = await this.alertController.create({
            header: 'Error',
            message: 'Todos los campos son obligatorios.',
            buttons: ['Aceptar']
        });
        await alert.present();
        return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');

    this.http.put(`${this.url}/api/user/update`, this.editProfileData, { headers }).subscribe(
        async (response: any) => {
            if (response.status === "success") {
                const alert = await this.alertController.create({
                    header: 'Actualización exitosa',
                    message: 'Se actualizó el perfil con éxito.',
                    buttons: ['Aceptar']
                });
                await alert.present();
            } else {
                const alert = await this.alertController.create({
                    header: 'Error',
                    message: 'Ocurrió un error al actualizar el perfil.',
                    buttons: ['Aceptar']
                });
                await alert.present();
            }

            this.currentUserInfo = response.user; // Actualiza la información del perfil
            this.closeEditProfileModal(); // Cierra el modal
        },
        async (error) => {
            const alert = await this.alertController.create({
                header: 'Error',
                message: 'Ocurrió un error al actualizar el perfil.',
                buttons: ['Aceptar']
            });
            await alert.present();
        }
    );
}

  logout() {
    let token = sessionStorage.getItem("token");

    if (token) {
        fetch('http://localhost:4000/api/user/logout', {
            method: 'POST',
            headers: {
                'Authorization': `${token}`
            }
        })
        .then(response => response.json())
        .then(async data => {
            if (data.status === "success") {
                sessionStorage.clear();
                const alert = document.createElement('ion-alert');
                alert.header = 'Logout';
                alert.message = 'Se cerró sesión con éxito';
                alert.buttons = [{
                    text: 'Aceptar',
                    handler: () => {
                        sessionStorage.removeItem("token");
                        window.location.reload();
                    }
                }];
                document.body.appendChild(alert);
                await alert.present();
            } else {
                const alert = document.createElement('ion-alert');
                alert.header = 'Error';
                alert.message = 'Error al cerrar sesión';
                alert.buttons = ['Aceptar'];
                document.body.appendChild(alert);
                await alert.present();
            }
        })
        .catch(error => {
            console.error("Error during logout:", error);
        });
    } else {
        console.error("No token found in sessionStorage.");
    }
  }

  openImageSelectorModal() {
    this.selectedImage = `${this.url_avatars}${this.currentUserInfo.image}`; // Imagen actual del perfil
    this.isImageSelectorModalOpen = true;
  }

  closeImageSelectorModal() {
      this.isImageSelectorModalOpen = false;
  }

  onImageSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
              this.selectedImage = e.target.result; // Asigna la nueva imagen seleccionada para previsualización
          };
          reader.readAsDataURL(file);
      }
  }

  async updateProfileImage() {
    if (!this.selectedImage) {
        const alert = await this.alertController.create({
            header: 'Error',
            message: 'Por favor selecciona una imagen para actualizar.',
            buttons: ['Aceptar']
        });
        await alert.present();
        return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');

    const formData = new FormData();
    formData.append('file0', (document.querySelector('input[type="file"]') as HTMLInputElement).files![0]);

    this.http.post(`${this.url}/api/user/upload`, formData, { headers }).subscribe(
        async (response: any) => {
            if (response.status === "success") {
                const alert = await this.alertController.create({
                    header: 'Actualización exitosa',
                    message: 'La foto de perfil se actualizó con éxito.',
                    buttons: ['Aceptar']
                });
                await alert.present();
            } else {
                const alert = await this.alertController.create({
                    header: 'Error',
                    message: 'Ocurrió un error al actualizar la foto de perfil.',
                    buttons: ['Aceptar']
                });
                await alert.present();
            }
            this.closeImageSelectorModal();
        },
        async (error) => {
            const alert = await this.alertController.create({
                header: 'Error',
                message: 'Ocurrió un error al actualizar la foto de perfil.',
                buttons: ['Aceptar']
            });
            await alert.present();
        }
    );
  }

  loadUserList() {
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage
  
    if (token) {
      const url = `${this.url}/api/user/list/`;
      const headers = new HttpHeaders().set('Authorization', token);
  
      // Realiza la solicitud HTTP para obtener la lista de usuarios
      this.http.get(url, { headers }).subscribe(
        (response: any) => {
          this.usuariosUmg = response.users;
          console.log("Lista de usuarios:", this.usuariosUmg, JSON.stringify(this.usuariosUmg));
        },
        (error) => {
          console.error("Error al cargar la lista de usuarios:", error);
        }
      );
    } else {
      console.error("No se encontró el token en sessionStorage");
    }
  }
  isFollowingModalOpen: boolean = false; // Estado para controlar la visibilidad del modal

  // Método para abrir el modal de Following
  openFollowingModal() {
    this.isFollowingModalOpen = true;
    this.loadUserList(); // Cargar la lista de usuarios cuando se abra el modal
  }

  // Método para cerrar el modal de Following
  closeFollowingModal() {
    this.isFollowingModalOpen = false;
  }

  // Método para seguir a un usuario
  followUser(userId: string) {
    const id_seguidor = sessionStorage.getItem('id'); // Obtén el id del usuario desde sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (id_seguidor && token) {
      const url = `http://localhost:3000/api/follows/follow`;
      const headers = new HttpHeaders().set('Authorization', token);
      const body = {
        id_seguido: userId,
        id_seguidor: id_seguidor
      };

      // Realiza la solicitud HTTP para seguir al usuario
      this.http.post(url, body, { headers }).subscribe(
        async (response: any) => {
          console.log("Respuesta de seguimiento:", response);
          const alert = await this.alertController.create({
            header: 'Seguimiento',
            message: 'Has seguido al usuario con éxito.',
            buttons: ['Aceptar']
          });
          await alert.present();
          this.loadFollowing();
        },
        async (error) => {
          console.error("Error al seguir al usuario:", error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al intentar seguir al usuario.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }
  
  // Método para verificar si ya sigue a un usuario
  isFollowing(userId: string): boolean {
    return this.following.some(follow => follow.id_seguido === userId);
  }

  // Método para alternar entre seguir y dejar de seguir
  toggleFollow(userId: string) {
    if (this.isFollowing(userId)) {
      this.unfollowUser(userId);
    } else {
      this.followUser(userId);
    }
  }

  // Método para dejar de seguir a un usuario
  unfollowUser(userId: string) {
    const id_seguidor = sessionStorage.getItem('id'); // Obtén el id del usuario desde sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (id_seguidor && token) {
      const url = `http://localhost:3000/api/follows/unfollow`; // Supón que tienes un endpoint para unfollow
      const headers = new HttpHeaders().set('Authorization', token);
      const body = {
        id_seguido: userId,
        id_seguidor: id_seguidor
      };

      // Realiza la solicitud HTTP para dejar de seguir al usuario
      this.http.post(url, body, { headers }).subscribe(
        async (response: any) => {
          console.log("Respuesta de dejar de seguir:", response);
          const alert = await this.alertController.create({
            header: 'Unfollow',
            message: 'Has dejado de seguir al usuario con éxito.',
            buttons: ['Aceptar']
          });
          await alert.present();
          this.loadFollowing(); // Recargar la lista de following
        },
        async (error) => {
          console.error("Error al dejar de seguir al usuario:", error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al intentar dejar de seguir al usuario.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }

  loadFollowing() {
    const id_seguidor = sessionStorage.getItem('id'); // Obtén el id del usuario de sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (id_seguidor && token) {
      const url = `${this.url_posts}/api/follows/getFollowsByFollowerId`;
      const headers = new HttpHeaders().set('Authorization', token);
      const body = { id_seguidor }; // El cuerpo de la solicitud POST

      // Realiza la solicitud HTTP para obtener la lista de following
      this.http.post(url, body, { headers }).subscribe(
        (response: any) => {
          this.following = response;
          console.log("Following:", this.following, JSON.stringify(this.following));
        },
        (error) => {
          console.error("Error al cargar los following:", error);
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }
  
}
