import { membershipRepository } from "./memberships.repository";

class MembershipService {
    createMembership(data) {
        return membershipRepository.createMembership(data);
    }

    updateMembership(data) {
        return membershipRepository.deactivateMembership(data);
    }

    reactivateMembership(clubId: string, userId: string) {
        return membershipRepository.reactivateMembership(clubId, userId);
    }

    deleteMembership(clubId: string, userId: string) {
        return membershipRepository.removeMembership(clubId, userId);
    }
    getAllMembersOfaClub(clubId: string) {
        return membershipRepository.getAllMembersOfaClub(clubId);
    }

    getAllClubsOfaGolfer(userId: string) {
        return membershipRepository.getAllClubsOfaGolfer(userId);
    }
}

export const membershipService = new MembershipService();