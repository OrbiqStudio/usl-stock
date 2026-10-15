; Nettoyage avant installation / mise à jour.
; Les anciennes versions (<= 1.4.2) contenaient des milliers de fichiers inutiles (sorties de
; compilation Android) avec des chemins trop longs : le désinstalleur de Windows ne pouvait
; pas les déplacer et l'installation s'arrêtait sur « USL Stock ne peut pas être fermé ».
; On supprime ce dossier inutile avant que l'ancien désinstalleur ne démarre.
!macro customInit
  ReadRegStr $0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${if} $0 != ""
    RMDir /r "$0\resources\app.asar.unpacked"
  ${endif}
  RMDir /r "$LOCALAPPDATA\Programs\USL Stock\resources\app.asar.unpacked"
!macroend
