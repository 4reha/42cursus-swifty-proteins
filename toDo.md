# Mandatory Part - Todo Checklist

## Step 1: Application Setup

- [x] Choose an icon for the application (theme-aligned)
- [x] Implement a launch screen
  - [x] Ensure the launch screen displays for a noticeable duration

## Step 2: Login View

- [x] Choose an authentication system to store/manage user accounts (GitHub OAuth2.0)
- [x] Allow account creation
- [x] Enable fingerprint authentication
  - [x] iOS: TouchID
  - [x] Android: BiometricManager
- [x] Setup the fingerprint authentication auth after 1st successful password auth
- [x] fingerprint authentication should be available only if the the user has set it up
- [x] Show popup warning if authentication fails
- [x] Add password login fallback (for devices without fingerprint sensor)
- [x] Ensure Login View always appears on app launch
  - [x] Relaunching app (without quitting) must still display Login View

## Step 3: Protein List View

- [x] List all ligands from `ligands.txt`
- [x] Implement search functionality for ligands
- [x] Fetch ligand data from `https://files.rcsb.org/ligands/download/{ligand-id}.cif`
- [x] Show warning message if ligand cannot load from website
- [x] Show loading animation (spinner or clean animation) while loading ligand

## Step 4: Protein View

- [ ] Display ligand model in 3D
  - [ ] Use SceneKit (iOS), ViroCore (Android), or Metal/Vulkan
  - [ ] Avoid full GameEngines
- [ ] Apply CPK coloring
- [ ] Implement Balls and Sticks model
- [ ] Add atom tooltips/popup
  - [ ] Show atom symbol (C, H, O, etc.)
  - [ ] Tooltip disappears when clicking outside
- [ ] Add "Share" button for model sharing
- [ ] Enable interaction with ligand (zoom, rotate, etc.)
- [ ] Incorporate alternative protein structure visualization models
