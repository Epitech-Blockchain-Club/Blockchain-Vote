Structure générale et variables

solidity

struct Candidate {
    string name;
    uint256 voteCount;
}

address public immutable owner;
bool public electionActive;
bool public electionCompleted;
uint256 public startTime;
uint256 public endTime;
uint256 public neutralVotes;
uint256 public totalVotes;

Candidate[] public candidates;
mapping(address => bool) public hasVoted;

    Candidate : Structure stockant le nom et le nombre de votes pour chaque candidat
    owner : Adresse du créateur du contrat (administrateur), marquée comme immutable pour sécurité et économie de gas
    electionActive : Indique si l'élection est en cours
    electionCompleted : Indique si l'élection est définitivement terminée
    startTime/endTime : Horodatages du début et de la fin de l'élection
    neutralVotes/totalVotes : Compteurs pour les votes neutres et le total des votes
    candidates : Tableau contenant tous les candidats
    hasVoted : Mapping qui trace si une adresse a déjà voté ou non

Événements et erreurs personnalisées

solidity

event ElectionStarted(uint256 startTime);
event ElectionEnded(uint256 endTime);
event CandidateAdded(string name, uint256 candidateId);
event VoteCast(address indexed voter, uint256 indexed candidateId);
event NeutralVoteCast(address indexed voter);
event EmergencyStop(address initiator, uint256 timestamp);

error AlreadyVoted();
error ElectionNotActive();
// ... autres erreurs

    Événements : Permettent de journaliser les actions importantes sur la blockchain
    Erreurs personnalisées : Remplacent les require traditionnels pour économiser du gas et fournir des messages d'erreur plus clairs

Modificateurs

solidity

modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
}

modifier electionOngoing() {
    if (!electionActive) revert ElectionNotActive();
    _;
}

modifier electionNotCompleted() {
    if (electionCompleted) revert ElectionAlreadyCompleted();
    _;
}

    onlyOwner : Restreint l'accès aux fonctions administratives
    electionOngoing : Vérifie que l'élection est active
    electionNotCompleted : Vérifie que l'élection n'est pas définitivement terminée

Gestion du cycle de vie de l'élection

solidity

function startElection() external onlyOwner electionNotCompleted {
    if (electionActive) revert ElectionAlreadyActive();
    if (candidates.length == 0) revert InvalidCandidate();
    
    electionActive = true;
    startTime = block.timestamp;
    
    emit ElectionStarted(startTime);
}

function endElection() external onlyOwner electionOngoing {
    electionActive = false;
    electionCompleted = true;
    endTime = block.timestamp;
    
    emit ElectionEnded(endTime);
}

function emergencyStop() external onlyOwner electionOngoing {
    electionActive = false;
    
    emit EmergencyStop(msg.sender, block.timestamp);
}

    startElection : Démarre l'élection si des candidats existent
    endElection : Termine définitivement l'élection et enregistre l'heure de fin
    emergencyStop : Permet d'arrêter temporairement l'élection sans la clôturer définitivement

Gestion des candidats

solidity

function addCandidate(string calldata _name) external onlyOwner electionNotCompleted {
    if (electionActive) revert ElectionAlreadyActive();
    if (bytes(_name).length == 0) revert EmptyName();
    
    uint256 candidateId = candidates.length;
    candidates.push(Candidate(_name, 0));
    
    emit CandidateAdded(_name, candidateId);
}

    Permet d'ajouter un candidat uniquement avant le début de l'élection
    Vérifie que le nom n'est pas vide
    Émet un événement pour la transparence

Processus de vote

solidity

function vote(uint256 candidateIndex) external electionOngoing {
    if (hasVoted[msg.sender]) revert AlreadyVoted();
    if (candidateIndex >= candidates.length) revert InvalidCandidate();
    
    candidates[candidateIndex].voteCount++;
    hasVoted[msg.sender] = true;
    totalVotes++;
    
    emit VoteCast(msg.sender, candidateIndex);
}

function voteNeutral() external electionOngoing {
    if (hasVoted[msg.sender]) revert AlreadyVoted();
    
    neutralVotes++;
    hasVoted[msg.sender] = true;
    totalVotes++;
    
    emit NeutralVoteCast(msg.sender);
}

    vote : Permet de voter pour un candidat spécifique
    voteNeutral : Permet d'exprimer un vote blanc/neutre
    Les deux fonctions vérifient que l'électeur n'a pas déjà voté
    Les deux fonctions incrémentent le compteur total de votes

Fonctions d'information

solidity

function getCandidates() external view returns (Candidate[] memory) {
    return candidates;
}

function getResults() external view returns (string memory winner, uint256 maxVotes, uint256 _neutralVotes, uint256 _totalVotes) {
    require(!electionActive || electionCompleted, "L'election est encore en cours");
    
    // Logique pour déterminer le gagnant...
}

function checkVoterStatus(address voter) external view returns (bool) {
    return hasVoted[voter];
}

function getElectionStatus() external view returns (uint8 status, uint256 _startTime, uint256 _endTime) {
    // Retourne l'état actuel de l'élection...
}

    getCandidates : Retourne la liste complète des candidats
    getResults : Calcule et retourne le gagnant et les statistiques de vote
    checkVoterStatus : Vérifie si une adresse a déjà voté
    getElectionStatus : Fournit l'état actuel de l'élection (non démarrée, en cours, terminée)

Cycle de vie complet d'une élection

    Phase d'initialisation :
        L'administrateur ajoute les candidats avec addCandidate
        Cette phase doit être complétée avant le début de l'élection
    Phase de vote :
        L'administrateur démarre l'élection avec startElection
        Les électeurs votent via vote ou voteNeutral
        Chaque électeur ne peut voter qu'une seule fois
    Phase de clôture :
        L'administrateur termine l'élection avec endElection
        Les résultats sont disponibles via getResults
        L'élection ne peut plus être modifiée après clôture
    Gestion d'urgence :
        En cas de problème, l'administrateur peut suspendre temporairement l'élection via emergencyStop
        Il peut ensuite, selon le cas, redémarrer ou clôturer définitivement l'élection

Ce smart contract offre un système de vote complet, sécurisé et transparent pour les élections du bureau des étudiants.