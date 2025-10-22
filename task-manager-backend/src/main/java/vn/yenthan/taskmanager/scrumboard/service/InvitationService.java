package vn.yenthan.taskmanager.scrumboard.service;

import vn.yenthan.taskmanager.scrumboard.dto.InviteRequestDto;
import java.util.Map;

public interface InvitationService {

    Map<String, Object> invite(Long boardId, InviteRequestDto request, Long currentUserId);

    Map<String, Object> accept(String token, Long currentUserId);

    Map<String, Object> complete(String token, Long userId);
}


