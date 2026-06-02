import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import Button from '../components/Button';

// =============================================================
// TELA DO JOGO 2D - COELHO SALTADOR
// Implementa: Game Loop (requestAnimationFrame), movimentação
// de sprite (pulo com gravidade), pontuação em tempo real e
// detecção de colisão AABB.
// =============================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constantes do jogo
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.55;
const GROUND_HEIGHT = 70;          // altura do "chão"
const PLAYER_SIZE = 50;
const PLAYER_X = 60;               // posição fixa do jogador no eixo X
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 50;
const GRAVITY = 0.95;              // gravidade aplicada a cada frame
const JUMP_VELOCITY = -16;         // negativo = sobe (impulso do pulo)
const OBSTACLE_SPEED = 6;          // velocidade dos cactos

export default function GameScreen() {
  // ESTADOS visuais (re-renderizam a tela)
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);

  // REFS (não causam re-render - usadas pelo Game Loop a cada frame)
  const playerYRef = useRef(0);      // posição vertical (0 = no chão)
  const playerVyRef = useRef(0);     // velocidade vertical
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const nextSpawnRef = useRef(60);

  // ===========================================================
  // DETECÇÃO DE COLISÃO AABB (Axis-Aligned Bounding Box)
  // ===========================================================
  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  };

  // ===========================================================
  // AÇÃO DE PULAR - só permite se estiver no chão
  // ===========================================================
  const jump = () => {
    if (!isPlaying || gameOver) return;
    if (playerYRef.current >= -2) {
      playerVyRef.current = JUMP_VELOCITY;
    }
  };

  // ===========================================================
  // GAME LOOP - executa continuamente com requestAnimationFrame
  // ===========================================================
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId;

    const gameLoop = () => {
      frameCountRef.current += 1;

      // --- 1) Física do jogador: aplica gravidade ---
      playerVyRef.current += GRAVITY;
      playerYRef.current += playerVyRef.current;

      // Não deixar atravessar o chão
      if (playerYRef.current > 0) {
        playerYRef.current = 0;
        playerVyRef.current = 0;
      }

      // --- 2) Spawn de novos cactos (intervalos aleatórios) ---
      if (frameCountRef.current - lastSpawnRef.current >= nextSpawnRef.current) {
        lastSpawnRef.current = frameCountRef.current;
        nextSpawnRef.current = 50 + Math.floor(Math.random() * 80);
        obstaclesRef.current.push({
          id: Date.now() + Math.random(),
          x: SCREEN_WIDTH,
        });
      }

      // --- 3) Caixa de colisão do jogador ---
      const playerBox = {
        x: PLAYER_X,
        y: GAME_AREA_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE + playerYRef.current,
        w: PLAYER_SIZE,
        h: PLAYER_SIZE,
      };

      // --- 4) Move cactos e checa colisão ---
      let collided = false;
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
        .filter((o) => {
          if (o.x < -OBSTACLE_WIDTH) return false;

          const obstacleBox = {
            x: o.x,
            y: GAME_AREA_HEIGHT - GROUND_HEIGHT - OBSTACLE_HEIGHT,
            w: OBSTACLE_WIDTH,
            h: OBSTACLE_HEIGHT,
          };

          if (checkCollision(playerBox, obstacleBox)) {
            collided = true;
          }
          return true;
        });

      // --- 5) Game Over se colidiu ---
      if (collided) {
        const finalScore = Math.floor(scoreRef.current / 6);
        setHighScore((prev) => (finalScore > prev ? finalScore : prev));
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // --- 6) Pontuação cresce com o tempo ---
      scoreRef.current += 1;

      // --- 7) Atualiza estados visuais ---
      setPlayerY(playerYRef.current);
      setObstacles([...obstaclesRef.current]);
      setScore(Math.floor(scoreRef.current / 6));

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // ===========================================================
  // INICIAR JOGO
  // ===========================================================
  const startGame = () => {
    scoreRef.current = 0;
    playerYRef.current = 0;
    playerVyRef.current = 0;
    obstaclesRef.current = [];
    frameCountRef.current = 0;
    lastSpawnRef.current = 0;
    nextSpawnRef.current = 60;

    setScore(0);
    setPlayerY(0);
    setObstacles([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  // ===========================================================
  // RENDERIZAÇÃO
  // ===========================================================
  return (
    <View style={styles.container}>
      {/* Placar */}
      <View style={styles.scoreBar}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>PONTOS</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>RECORDE</Text>
          <Text style={styles.scoreText}>{highScore}</Text>
        </View>
      </View>

      {/* Área de jogo (tocar pula) */}
      <TouchableWithoutFeedback onPress={jump}>
        <View style={[styles.gameArea, { height: GAME_AREA_HEIGHT }]}>
          {/* Sol decorativo */}
          <View style={styles.sun} />

          {/* Chão */}
          <View
            style={[styles.ground, { top: GAME_AREA_HEIGHT - GROUND_HEIGHT }]}
          />

          {/* Jogador (coelho) */}
          <View
            style={[
              styles.player,
              {
                left: PLAYER_X,
                top: GAME_AREA_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE + playerY,
              },
            ]}
          >
            <Text style={styles.playerEmoji}>🐰</Text>
          </View>

          {/* Cactos */}
          {obstacles.map((o) => (
            <View
              key={o.id}
              style={[
                styles.obstacle,
                {
                  left: o.x,
                  top: GAME_AREA_HEIGHT - GROUND_HEIGHT - OBSTACLE_HEIGHT,
                },
              ]}
            >
              <Text style={styles.obstacleEmoji}>🌵</Text>
            </View>
          ))}

          {/* Tela inicial */}
          {!isPlaying && !gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.title}>🐰 Coelho Saltador</Text>
              <Text style={styles.subtitle}>
                Toque na tela ou no botão PULAR{'\n'}para desviar dos cactos!
              </Text>
              <Button title="▶ Iniciar Jogo" onPress={startGame} />
            </View>
          )}

          {/* Tela de Game Over */}
          {gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.gameOverTitle}>💥 Game Over!</Text>
              <Text style={styles.finalScore}>{score} pontos</Text>
              {score === highScore && score > 0 && (
                <Text style={styles.newRecord}>🏆 Novo recorde!</Text>
              )}
              <Button title="↻ Jogar novamente" onPress={startGame} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Botão de pulo */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.jumpButton,
            (!isPlaying || gameOver) && styles.jumpButtonDisabled,
          ]}
          onPress={jump}
          activeOpacity={0.7}
          disabled={!isPlaying || gameOver}
        >
          <Text style={styles.jumpText}>PULAR ⬆</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d3557' },
  scoreBar: {
    flexDirection: 'row',
    backgroundColor: '#e63946',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { color: '#fff', fontSize: 11, letterSpacing: 1.5, opacity: 0.9 },
  scoreText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  gameArea: {
    backgroundColor: '#fce5b8',
    position: 'relative',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffd166',
    opacity: 0.9,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    backgroundColor: '#d4a373',
    borderTopWidth: 3,
    borderTopColor: '#8b5a2b',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerEmoji: { fontSize: 42 },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  obstacleEmoji: { fontSize: 44 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(29,53,87,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  gameOverTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  finalScore: {
    color: '#ffd166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newRecord: {
    color: '#ffd166',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1d3557',
  },
  jumpButton: {
    width: 200,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  jumpButtonDisabled: { backgroundColor: '#666', opacity: 0.5 },
  jumpText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
});
